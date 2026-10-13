import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notify";
import { ROLE_LABELS } from "@/lib/db";

const STATUSES = ["Approved", "Rejected", "Changes requested", "Pending review", "Level suggested"];

// POST /api/admin/cv-review
// { cvId, candidateId, status, note }  — admins only.
// Records the decision + note, notifies the candidate in-app, and emails them
// if an email provider is configured.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { cvId, candidateId, status, note } = body || {};
  if (!cvId || !candidateId || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "cvId, candidateId and a valid status are required" }, { status: 400 });
  }

  // A rejection (or a request for changes) must tell the candidate why.
  const reason = String(note || "").trim();
  if ((status === "Rejected" || status === "Changes requested") && !reason) {
    return NextResponse.json({ error: "Add a note explaining why — the candidate sees it and needs to know what to fix." }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Suggesting a lower level: it must be the SAME role, a lower level, and open.
  let suggested = null, current = null;
  if (status === "Level suggested") {
    if (!reason) return NextResponse.json({ error: "Add a note explaining the suggested level." }, { status: 400 });
    const { data: cand } = await admin.from("candidates").select("target_role").eq("id", candidateId).maybeSingle();
    const keys = [cand?.target_role, body?.suggestedRole].filter(Boolean);
    const { data: rows } = await admin.from("role_requirements").select("role_key, title, base_role, level, enabled").in("role_key", keys);
    current = rows?.find((r) => r.role_key === cand?.target_role);
    suggested = rows?.find((r) => r.role_key === body?.suggestedRole);
    const order = ["junior", "mid", "senior"];
    if (!current || !suggested || suggested.base_role !== current.base_role || order.indexOf(suggested.level) >= order.indexOf(current.level) || suggested.enabled === false) {
      return NextResponse.json({ error: "The suggested level must be a lower, open level of the candidate's current role." }, { status: 400 });
    }
  }

  // 1) Update the CV row.
  const fields = { status, review_note: reason || null, reviewed_by: me.id, reviewed_at: new Date().toISOString() };
  const levelFields = status === "Level suggested"
    ? { suggested_role: suggested.role_key, original_role: current.role_key, level_response: null, level_responded_at: null }
    : { suggested_role: null };
  let { error: upErr } = await admin.from("cvs").update({ ...fields, ...levelFields }).eq("id", cvId);
  if (upErr && status !== "Level suggested" && /suggested_role/.test(upErr.message || "")) {
    ({ error: upErr } = await admin.from("cvs").update(fields).eq("id", cvId)); // pre-0036
  }
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  if (status === "Level suggested") {
    const res = await notifyUser(admin, {
      userId: candidateId,
      title: `We suggest the ${suggested.title} level`,
      body: `${reason}\n\nOpen your CV page to accept ${suggested.title} — your CV is approved at that level and your AI interview unlocks straight away — or keep ${current.title}.`,
      emailSubject: "NexIT-Africa — a level suggestion for your application",
      cta: { label: "Review the suggestion", path: "/dashboard/cv-upload" },
    });
    return NextResponse.json({ ok: true, emailSent: res.emailSent, emailReason: res.emailSent ? undefined : res.reason });
  }

  // 2) Tell the candidate (in-app + email), including the reviewer's reason.
  const verb =
    status === "Approved" ? "approved" : status === "Rejected" ? "rejected" : status === "Changes requested" ? "returned for changes" : "updated";
  const text =
    status === "Approved"
      ? `Your CV has been approved — you can now take your AI interview.${reason ? `\n\nReviewer note: ${reason}` : ""}`
      : status === "Rejected"
      ? `Your CV was not approved.\n\nReason: ${reason}\n\nPlease update your CV and upload it again — you can take the AI interview once it's approved.`
      : status === "Changes requested"
      ? `Your CV needs a few changes before it can be approved.\n\nWhat to change: ${reason}\n\nPlease upload the updated CV — you can take the AI interview once it's approved.`
      : reason || "Your CV review status was updated.";
  const res = await notifyUser(admin, {
    userId: candidateId,
    title: `CV ${verb}`,
    body: text,
    emailSubject: `NexIT-Africa — your CV was ${verb}`,
    cta: status === "Approved"
      ? { label: "Take the AI interview", path: "/dashboard/interview/ai" }
      : { label: "Upload a new CV", path: "/dashboard/cv-upload" },
  });
  const email = { sent: res.emailSent, reason: res.reason };

  return NextResponse.json({
    ok: true,
    emailSent: email.sent,
    emailReason: email.sent ? undefined : email.reason,
  });
}
