import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

// GET /api/admin/staff-approvals — pending interviewer/recruiter applications.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data } = await admin
    .from("staff_applications")
    .select("user_id, role, kind, org_name, doc_path, doc_name, status, note, created_at, profiles:user_id(full_name, email, country, approval_status)")
    .order("created_at", { ascending: true });

  const rows = await Promise.all((data || []).map(async (a) => {
    let docUrl = null;
    if (a.doc_path) {
      const { data: s } = await admin.storage.from("staff-docs").createSignedUrl(a.doc_path, 3600);
      docUrl = s?.signedUrl || null;
    }
    return {
      userId: a.user_id,
      name: a.profiles?.full_name || "User",
      email: a.profiles?.email,
      country: a.profiles?.country || "",
      role: a.role,
      kind: a.kind,
      orgName: a.org_name,
      docName: a.doc_name,
      docUrl,
      status: a.status,
      approvalStatus: a.profiles?.approval_status,
      note: a.note,
      createdAt: a.created_at,
    };
  }));

  return NextResponse.json({ applications: rows });
}

// POST /api/admin/staff-approvals { userId, action: "approve"|"reject", note }
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { userId, action, note } = body || {};
  const ACTIONS = { approve: "approved", reject: "rejected", suspend: "suspended", reactivate: "approved" };
  if (!userId || !ACTIONS[action]) {
    return NextResponse.json({ error: "userId and a valid action are required" }, { status: 400 });
  }

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const approval = ACTIONS[action];
  const now = new Date().toISOString();

  const [{ error: e1 }, { error: e2 }] = await Promise.all([
    admin.from("profiles").update({ approval_status: approval }).eq("id", userId),
    admin.from("staff_applications").update({ status: approval, note: note || null, reviewed_by: me.id, reviewed_at: now }).eq("user_id", userId),
  ]);
  if (e1 || e2) return NextResponse.json({ error: (e1 || e2).message }, { status: 500 });

  const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", userId).single();
  const MSG = {
    approve: "Your NexIT-Africa account has been approved — you can now sign in and access your portal.",
    reactivate: "Your NexIT-Africa account has been reactivated — you can sign in and access your portal again.",
    reject: `Your NexIT-Africa account application wasn't approved.${note ? ` Note: ${note}` : ""}`,
    suspend: `Your NexIT-Africa account has been suspended.${note ? ` Note: ${note}` : ""} Please contact the team if you believe this is a mistake.`,
  };
  const TITLE = { approve: "Account approved", reactivate: "Account reactivated", reject: "Application not approved", suspend: "Account suspended" };
  await admin.from("notifications").insert({ user_id: userId, title: TITLE[action], body: MSG[action], read: false });
  await sendEmail({ to: prof?.email, subject: `NexIT-Africa — ${TITLE[action].toLowerCase()}`, text: `Hi ${prof?.full_name || "there"},\n\n${MSG[action]}\n\n— The NexIT-Africa team` });

  return NextResponse.json({ ok: true, approval });
}
