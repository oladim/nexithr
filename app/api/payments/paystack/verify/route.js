import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { paystackVerify } from "@/lib/paystack";
import { notifyUser } from "@/lib/notify";
import { alertAdmins } from "@/lib/adminAlert";

export const runtime = "nodejs";

// POST /api/payments/paystack/verify  { reference }
// Verifies the transaction and applies its effect (subscription or training
// access). Idempotent: a reference that already succeeded just returns ok.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const reference = body?.reference;
  if (!reference) return NextResponse.json({ error: "reference required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: pay } = await admin.from("candidate_payments").select("*").eq("reference", reference).maybeSingle();
  if (!pay) return NextResponse.json({ error: "Unknown payment reference" }, { status: 404 });
  if (pay.candidate_id !== me.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (pay.status === "success") {
    return NextResponse.json({ ok: true, already: true, purpose: pay.purpose, roleKey: pay.role_key });
  }

  const v = await paystackVerify(reference);
  if (v.error) return NextResponse.json({ error: v.error }, { status: 502 });
  if (!v.ok) {
    await admin.from("candidate_payments").update({ status: "failed" }).eq("reference", reference);
    return NextResponse.json({ ok: false, status: v.status || "failed" });
  }

  // Mark paid, then apply the effect.
  await admin.from("candidate_payments").update({ status: "success", paid_at: new Date().toISOString() }).eq("reference", reference);

  await alertAdmins(admin, {
    key: `pay:${reference}`,
    category: "payments",
    subject: `Payment received — ${pay.purpose === "subscription" ? "annual subscription" : "specific training"} (${me.full_name || "candidate"})`,
    summary: `${me.full_name || "A candidate"} completed a Paystack payment.`,
    details: [["Candidate", `${me.full_name || "—"} (${me.email || me.authEmail || ""})`], ["For", pay.purpose === "subscription" ? "Annual subscription" : `Specific training — ${pay.role_key || ""}${pay.tier ? ` (${pay.tier})` : ""}`], ["Amount", pay.amount != null ? `${pay.currency || "NGN"} ${Number(pay.amount).toLocaleString()}` : null], ["Reference", reference]],
    cta: { label: "Open admin", path: "/admin" },
  });

  if (pay.purpose === "subscription") {
    // Extend from the later of now or the current expiry, by one year.
    const { data: cand } = await admin.from("candidates").select("subscription_until").eq("id", me.id).maybeSingle();
    const base = cand?.subscription_until && new Date(cand.subscription_until) > new Date() ? new Date(cand.subscription_until) : new Date();
    base.setFullYear(base.getFullYear() + 1);
    await admin.from("candidates").update({ subscription_until: base.toISOString() }).eq("id", me.id);
    await notifyUser(admin, {
      userId: me.id,
      email: me.email || me.authEmail,
      name: me.full_name,
      title: "Subscription active",
      body: `Your annual subscription is active until ${base.toDateString()}. You now have unlimited AI interview retakes and access to suggested training.`,
      cta: { label: "Go to training", path: "/dashboard/training" },
    });
    return NextResponse.json({ ok: true, purpose: "subscription", subscriptionUntil: base.toISOString() });
  }

  // training
  await admin.from("training_access").upsert({ candidate_id: me.id, role_key: pay.role_key }, { onConflict: "candidate_id,role_key" });
  await notifyUser(admin, {
    userId: me.id,
    email: me.email || me.authEmail,
    name: me.full_name,
    title: "Specific training unlocked",
    body: "Your specific training for this role is now unlocked. You'll be invited to the live practical sessions when the programme reaches that stage.",
    cta: { label: "Open my courses", path: "/dashboard/training/specific" },
  });
  return NextResponse.json({ ok: true, purpose: "training", roleKey: pay.role_key });
}
