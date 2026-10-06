import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

// POST /api/interviewer/notify
// { candidateId, stage, message }  — interviewers / HR / admin only.
// Sends the candidate a note about their interview (in-app + email).
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!["interviewer", "admin", "recruiter"].includes(me.role))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { candidateId, stage, message } = body || {};
  if (!candidateId || !message?.trim()) {
    return NextResponse.json({ error: "candidateId and a message are required" }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", candidateId).single();

  const label = stage ? `${stage} interview` : "interview";
  const title = `Feedback on your ${label}`;

  await admin.from("notifications").insert({ user_id: candidateId, title, body: message.trim(), read: false });

  const email = await sendEmail({
    to: prof?.email,
    subject: `NexIT-Africa — feedback on your ${label}`,
    text: `Hi ${prof?.full_name || "there"},\n\n${message.trim()}\n\n— The NexIT-Africa interview panel`,
  });

  return NextResponse.json({ ok: true, emailSent: email.sent, emailReason: email.sent ? undefined : email.reason });
}
