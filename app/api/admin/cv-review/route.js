import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

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

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // 1) Update the CV row.
  const { error: upErr } = await admin
    .from("cvs")
    .update({ status, review_note: note || null, reviewed_by: me.id, reviewed_at: new Date().toISOString() })
    .eq("id", cvId);
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // 2) Look up the candidate's email + name for the notification / email.
  const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", candidateId).single();

  const verb =
    status === "Approved" ? "approved" : status === "Rejected" ? "rejected" : status === "Changes requested" ? "returned for changes" : "updated";
  const title = `CV ${verb}`;
  const body2 = note || `Your CV was ${verb}.`;

  // 3) In-app notification (always).
  await admin.from("notifications").insert({ user_id: candidateId, title, body: body2, read: false });

  // 4) Email (if configured).
  const email = await sendEmail({
    to: prof?.email,
    subject: `NexIT-Africa — your CV was ${verb}`,
    text: `Hi ${prof?.full_name || "there"},\n\n${body2}\n\n— The NexIT-Africa team`,
  });

  return NextResponse.json({
    ok: true,
    emailSent: email.sent,
    emailReason: email.sent ? undefined : email.reason,
  });
}
