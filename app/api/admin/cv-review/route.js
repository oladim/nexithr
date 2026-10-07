import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { notifyUser } from "@/lib/notify";

const STATUSES = ["Approved", "Rejected", "Changes requested", "Pending review"];

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

  // 1) Update the CV row.
  const { error: upErr } = await admin
    .from("cvs")
    .update({ status, review_note: reason || null, reviewed_by: me.id, reviewed_at: new Date().toISOString() })
    .eq("id", cvId);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

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
