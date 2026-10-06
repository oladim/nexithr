import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";
import { ROLE_LABELS } from "@/lib/db";

export const runtime = "nodejs";

const STATUSES = ["Applied", "Shortlisted", "Interviewing", "Hired", "Rejected"];

// Who may act on this job's applicants: admins (any) or the job's poster.
async function authorizeJob(admin, me, jobId) {
  const { data: job } = await admin.from("jobs").select("id, title, posted_by").eq("id", jobId).maybeSingle();
  if (!job) return { error: "Unknown job", status: 404 };
  const allowed = me.role === "admin" || job.posted_by === me.id;
  if (!allowed) return { error: "Forbidden", status: 403 };
  return { job };
}

// GET /api/jobs/applicants?jobId=... — applicants for one job.
export async function GET(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!["admin", "recruiter"].includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const jobId = request.nextUrl?.searchParams?.get("jobId");
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const auth = await authorizeJob(admin, me, jobId);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { data } = await admin
    .from("applications")
    .select("id, status, created_at, candidate_id, candidates(target_role, on_board, experience, skills, profiles(full_name, email, country))")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  const applicants = (data || []).map((a) => ({
    id: a.id,
    candidateId: a.candidate_id,
    name: a.candidates?.profiles?.full_name || "Candidate",
    email: a.candidates?.profiles?.email,
    country: a.candidates?.profiles?.country || "",
    role: ROLE_LABELS[a.candidates?.target_role] || a.candidates?.target_role || "—",
    experience: a.candidates?.experience || "",
    skills: a.candidates?.skills || [],
    onBoard: !!a.candidates?.on_board,
    status: a.status || "Applied",
    appliedAt: a.created_at,
  }));

  return NextResponse.json({ job: { id: auth.job.id, title: auth.job.title }, applicants });
}

// POST /api/jobs/applicants { applicationId, status } — update one applicant.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!["admin", "recruiter"].includes(me.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { applicationId, status } = body || {};
  if (!applicationId || !STATUSES.includes(status)) return NextResponse.json({ error: "applicationId and a valid status are required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: app } = await admin.from("applications").select("id, job_id, candidate_id").eq("id", applicationId).maybeSingle();
  if (!app) return NextResponse.json({ error: "Unknown application" }, { status: 404 });
  const auth = await authorizeJob(admin, me, app.job_id);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { error } = await admin.from("applications").update({ status }).eq("id", applicationId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Notify the candidate on meaningful status changes.
  if (["Shortlisted", "Interviewing", "Hired", "Rejected"].includes(status)) {
    const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", app.candidate_id).single();
    const msg = status === "Hired"
      ? `Congratulations! You've been marked as Hired for "${auth.job.title}".`
      : status === "Rejected"
      ? `Thank you for applying to "${auth.job.title}". The employer has decided not to move forward this time.`
      : `Update on your application for "${auth.job.title}": you're now ${status}.`;
    await admin.from("notifications").insert({ user_id: app.candidate_id, title: `Application ${status}`, body: msg, read: false });
    await sendEmail({ to: prof?.email, subject: `NexIT-Africa — application ${status}`, text: `Hi ${prof?.full_name || "there"},\n\n${msg}\n\n— The NexIT-Africa team` });
  }

  return NextResponse.json({ ok: true, status });
}
