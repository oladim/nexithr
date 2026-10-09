import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { alertAdmins } from "@/lib/adminAlert";

export const runtime = "nodejs";

// POST /api/jobs/apply { jobId } — board-ready candidates only.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Only candidates can apply." }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const jobId = body?.jobId;
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Board-ready gate: candidate must have completed the pipeline.
  const { data: cand } = await admin.from("candidates").select("on_board").eq("id", me.id).maybeSingle();
  if (!cand?.on_board) {
    return NextResponse.json({ error: "You can apply once you're board-ready — pass the AI, Professional and HR interviews first." }, { status: 403 });
  }

  // Job must exist and be approved.
  const { data: job } = await admin.from("jobs").select("id, status, title").eq("id", jobId).maybeSingle();
  if (!job || job.status !== "approved") return NextResponse.json({ error: "That job isn't open for applications." }, { status: 400 });

  const { error } = await admin.from("applications").upsert(
    { candidate_id: me.id, job_id: jobId, status: "Applied" },
    { onConflict: "candidate_id,job_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await alertAdmins(admin, {
    key: `apply:${me.id}:${jobId}`,
    category: "jobs",
    subject: `Job application — ${me.full_name || "a candidate"} → ${job.title}`,
    summary: `${me.full_name || "A board-ready candidate"} applied for “${job.title}”.`,
    details: [["Candidate", `${me.full_name || "—"} (${me.email || me.authEmail || ""})`], ["Job", job.title]],
    cta: { label: "Open job board", path: "/admin/jobs" },
  });
  return NextResponse.json({ ok: true });
}
