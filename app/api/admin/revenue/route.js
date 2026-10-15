import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { hasPerm } from "@/lib/permissions";
import { loadSettings } from "@/lib/db";
import { revenueSummary, grantSubscription, cancelSubscription, subscriptionState } from "@/lib/subscriptions";
import { alertAdmins } from "@/lib/adminAlert";
import { formatNaira } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard() {
  const access = await getSessionAccess();
  if (!access) return { res: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  if (access.role !== "admin" || !hasPerm(access, "revenue")) return { res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  const admin = getServiceSupabase();
  if (!admin) return { res: NextResponse.json({ error: "Server not configured" }, { status: 500 }) };
  return { access, admin };
}

const clean = (v, n = 120) => String(v ?? "").trim().slice(0, n);
// Escape PostgREST "or" filter metacharacters in a search term.
const term = (q) => clean(q, 80).replace(/[%,()*\\]/g, " ").trim();

async function profilesById(admin, ids) {
  const uniq = [...new Set(ids.filter(Boolean))];
  if (!uniq.length) return {};
  const { data } = await admin.from("profiles").select("id, full_name, email, phone").in("id", uniq);
  return Object.fromEntries((data || []).map((p) => [p.id, p]));
}

async function matchingIds(admin, q) {
  const t = term(q);
  if (!t) return null;
  const { data } = await admin.from("profiles").select("id").or(`full_name.ilike.%${t}%,email.ilike.%${t}%`).limit(500);
  return (data || []).map((p) => p.id);
}

function csv(rows, cols) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    // Neutralise spreadsheet formulas (CSV injection).
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return [cols.map((c) => c[0]).join(","), ...rows.map((r) => cols.map((c) => esc(c[1](r))).join(","))].join("\n");
}

// GET /api/admin/revenue?view=summary|payments|subscribers  (&format=csv)
//     /api/admin/revenue?find=<name or email>      candidate lookup
//     /api/admin/revenue?history=<candidateId>      subscription history
export async function GET(request) {
  const { admin, res } = await guard();
  if (res) return res;
  const sp = new URL(request.url).searchParams;

  if (sp.get("find") != null) {
    const t = term(sp.get("find"));
    if (t.length < 2) return NextResponse.json({ candidates: [] });
    const { data } = await admin.from("profiles").select("id, full_name, email, role")
      .eq("role", "candidate").or(`full_name.ilike.%${t}%,email.ilike.%${t}%`).limit(12);
    const ids = (data || []).map((p) => p.id);
    const { data: cands } = ids.length ? await admin.from("candidates").select("id, subscription_until, subscription_source").in("id", ids) : { data: [] };
    const byId = Object.fromEntries((cands || []).map((c) => [c.id, c]));
    return NextResponse.json({
      candidates: (data || []).filter((p) => byId[p.id]).map((p) => ({ ...p, subscriptionUntil: byId[p.id]?.subscription_until || null, state: subscriptionState(byId[p.id]?.subscription_until) })),
    });
  }

  if (sp.get("history")) {
    const id = clean(sp.get("history"), 64);
    const { data } = await admin.from("subscription_events").select("*").eq("candidate_id", id).order("created_at", { ascending: false }).limit(100);
    const actors = await profilesById(admin, (data || []).map((e) => e.actor_id));
    return NextResponse.json({ events: (data || []).map((e) => ({ ...e, actor: actors[e.actor_id]?.full_name || null })) });
  }

  const view = sp.get("view") || "payments";

  if (view === "summary") {
    const s = await revenueSummary(admin);
    const settings = await loadSettings(admin);
    return NextResponse.json({ ...s, currency: settings.currency || "NGN", annualPrice: Number(settings.subscription_annual_amount) || 0 });
  }

  if (view === "subscribers") {
    const state = sp.get("state") || "active";
    const now = new Date().toISOString();
    const soon = new Date(Date.now() + 30 * 86400000).toISOString();
    let q = admin.from("candidates").select("id, target_role, subscription_until, subscription_started_at, subscription_source, subscription_cancelled_at")
      .not("subscription_until", "is", null).order("subscription_until", { ascending: state !== "expired" }).limit(1000);
    if (state === "active") q = q.gt("subscription_until", now);
    if (state === "expiring") q = q.gt("subscription_until", now).lte("subscription_until", soon);
    if (state === "expired") q = q.lte("subscription_until", now);
    const ids = await matchingIds(admin, sp.get("q"));
    if (ids) q = ids.length ? q.in("id", ids) : q.eq("id", "00000000-0000-0000-0000-000000000000");
    const { data: rows, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const profs = await profilesById(admin, (rows || []).map((r) => r.id));
    // Total each subscriber has paid for subscriptions.
    const { data: pays } = rows?.length
      ? await admin.from("candidate_payments").select("candidate_id, amount").eq("status", "success").in("candidate_id", rows.map((r) => r.id))
      : { data: [] };
    const paid = {};
    for (const p of pays || []) paid[p.candidate_id] = (paid[p.candidate_id] || 0) + (Number(p.amount) || 0);
    const out = (rows || []).map((r) => ({
      ...r,
      candidate: profs[r.id] || null,
      state: subscriptionState(r.subscription_until),
      daysLeft: Math.ceil((new Date(r.subscription_until).getTime() - Date.now()) / 86400000),
      totalPaid: paid[r.id] || 0,
    }));
    if (sp.get("format") === "csv") {
      const body = csv(out, [
        ["Name", (r) => r.candidate?.full_name], ["Email", (r) => r.candidate?.email], ["Status", (r) => r.state],
        ["Started", (r) => r.subscription_started_at?.slice(0, 10)], ["Expires", (r) => r.subscription_until?.slice(0, 10)],
        ["Days left", (r) => r.daysLeft], ["Source", (r) => r.subscription_source], ["Total paid", (r) => r.totalPaid],
      ]);
      return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="subscribers-${state}.csv"` } });
    }
    return NextResponse.json({ subscribers: out });
  }

  // payments
  const status = sp.get("status") || "success";
  const purpose = sp.get("purpose") || "all";
  const provider = sp.get("provider") || "all";
  let q = admin.from("candidate_payments").select("*").order("created_at", { ascending: false }).limit(1000);
  if (status !== "all") q = q.eq("status", status);
  if (purpose !== "all") q = q.eq("purpose", purpose);
  if (provider !== "all") q = q.eq("provider", provider);
  if (sp.get("from")) q = q.gte("created_at", new Date(sp.get("from")).toISOString());
  if (sp.get("to")) q = q.lte("created_at", new Date(new Date(sp.get("to")).getTime() + 86399999).toISOString());
  const qs = term(sp.get("q"));
  if (qs) {
    const ids = await matchingIds(admin, qs);
    const refOr = `reference.ilike.%${qs}%`;
    q = ids?.length ? q.or(`${refOr},candidate_id.in.(${ids.join(",")})`) : q.or(refOr);
  }
  const { data: rows, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const profs = await profilesById(admin, [...(rows || []).map((r) => r.candidate_id), ...(rows || []).map((r) => r.recorded_by)]);
  const roleKeys = [...new Set((rows || []).map((r) => r.role_key).filter(Boolean))];
  const { data: roles } = roleKeys.length ? await admin.from("role_requirements").select("role_key, title").in("role_key", roleKeys) : { data: [] };
  const roleTitle = Object.fromEntries((roles || []).map((r) => [r.role_key, r.title]));
  const out = (rows || []).map((r) => ({
    ...r,
    candidate: profs[r.candidate_id] || null,
    recordedBy: profs[r.recorded_by]?.full_name || null,
    what: r.purpose === "subscription" ? "Annual subscription" : `Specific training — ${roleTitle[r.role_key] || r.role_key || "role"}${r.tier ? ` (${r.tier})` : ""}`,
  }));
  const total = out.filter((r) => r.status === "success").reduce((a, r) => a + (Number(r.amount) || 0), 0);
  if (sp.get("format") === "csv") {
    const body = csv(out, [
      ["Date", (r) => (r.paid_at || r.created_at)?.slice(0, 10)], ["Name", (r) => r.candidate?.full_name], ["Email", (r) => r.candidate?.email],
      ["For", (r) => r.what], ["Amount", (r) => r.amount], ["Currency", (r) => r.currency], ["Status", (r) => r.status],
      ["Method", (r) => r.provider], ["Reference", (r) => r.reference], ["Covers until", (r) => r.period_end?.slice(0, 10)],
      ["Recorded by", (r) => r.recordedBy], ["Note", (r) => r.note],
    ]);
    return new Response(body, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="payments.csv"` } });
  }
  return NextResponse.json({ payments: out, total });
}

// POST /api/admin/revenue
//   { action:"subscribe", candidateId, months?|until?, paid:boolean, amount?, reference?, note? }
//   { action:"cancel", candidateId, note? }
export async function POST(request) {
  const { access, admin, res } = await guard();
  if (res) return res;
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const candidateId = clean(body?.candidateId, 64);
  if (!candidateId) return NextResponse.json({ error: "Choose a candidate" }, { status: 400 });
  const note = clean(body?.note, 500);
  const { data: who } = await admin.from("profiles").select("full_name, email").eq("id", candidateId).maybeSingle();
  const name = who?.full_name || who?.email || "candidate";

  if (body?.action === "subscribe") {
    const paid = body.paid === true;
    const amount = Number(body.amount);
    if (paid && (!isFinite(amount) || amount <= 0)) return NextResponse.json({ error: "Enter the amount they paid" }, { status: 400 });
    if (paid && amount > 100_000_000) return NextResponse.json({ error: "That amount looks wrong" }, { status: 400 });
    const settings = await loadSettings(admin);
    const r = await grantSubscription(admin, {
      candidateId,
      source: paid ? "manual" : "complimentary",
      months: body.until ? undefined : Number(body.months) || 12,
      until: body.until || undefined,
      amount: paid ? amount : 0,
      currency: settings.currency || "NGN",
      reference: paid ? clean(body.reference, 120) : "",
      note,
      actorId: access.id,
      notify: body.notify !== false,
    });
    if (r.error) return NextResponse.json({ error: r.error }, { status: 400 });
    await alertAdmins(admin, {
      key: `sub:${candidateId}:${r.until}`,
      category: "payments",
      subject: `Subscription ${r.extended ? "extended" : "added"} manually: ${name}`,
      summary: `${access.full_name || "An admin"} ${paid ? `recorded a ${formatNaira(amount)} payment and ` : "gave a complimentary subscription and "}set the expiry to ${new Date(r.until).toDateString()}.`,
      details: [["Candidate", name], ["Method", paid ? "Manual payment" : "Complimentary (no payment)"], ["Expires", new Date(r.until).toDateString()], ["Note", note || null]],
      cta: { label: "Open revenue", path: "/admin/revenue" },
    }).catch(() => {});
    return NextResponse.json({ ok: true, until: r.until, extended: r.extended });
  }

  if (body?.action === "cancel") {
    const r = await cancelSubscription(admin, { candidateId, actorId: access.id, note, notify: body.notify !== false });
    if (r.error) return NextResponse.json({ error: r.error }, { status: 400 });
    await alertAdmins(admin, {
      key: `unsub:${candidateId}:${Date.now()}`,
      category: "payments",
      subject: `Subscription ended: ${name}`,
      summary: `${access.full_name || "An admin"} ended this subscription.`,
      details: [["Candidate", name], ["Reason", note || null]],
      cta: { label: "Open revenue", path: "/admin/revenue" },
    }).catch(() => {});
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
