import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email";

export const runtime = "nodejs";

async function requireAdmin() {
  const me = await getSessionProfile();
  if (!me) return { error: "Not signed in", status: 401 };
  if (me.role !== "admin") return { error: "Forbidden", status: 403 };
  const admin = getServiceSupabase();
  if (!admin) return { error: "Server not configured", status: 500 };
  return { me, admin };
}

// Total possible points for a course = sum of max_score on assignment/test modules.
async function totalMax(admin, courseId) {
  const { data } = await admin.from("course_modules").select("max_score, type").eq("course_id", courseId);
  return (data || []).filter((m) => ["assignment", "test", "quiz"].includes(m.type)).reduce((s, m) => s + (Number(m.max_score) || 0), 0);
}

// GET /api/admin/training?courseId=  — roster + submissions for grading.
export async function GET(request) {
  const g = await requireAdmin();
  if (g.error) return NextResponse.json({ error: g.error }, { status: g.status });
  const { admin } = g;

  const courseId = request.nextUrl?.searchParams?.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const { data: course } = await admin.from("specific_courses").select("id, title, role_key").eq("id", courseId).maybeSingle();
  if (!course) return NextResponse.json({ error: "Unknown course" }, { status: 404 });

  const { data: enrolls } = await admin
    .from("enrollments")
    .select("candidate_id, overall_score, result_released, profiles:candidate_id(full_name, email)")
    .eq("course_id", courseId);

  const { data: subs } = await admin
    .from("submissions")
    .select("id, candidate_id, module_id, text, file_path, score, feedback, status, submitted_at, course_modules:module_id(title, max_score, type)")
    .eq("course_id", courseId)
    .order("submitted_at", { ascending: true });

  const submissions = await Promise.all((subs || []).map(async (s) => {
    let fileUrl = null;
    if (s.file_path) { const { data } = await admin.storage.from("training").createSignedUrl(s.file_path, 3600); fileUrl = data?.signedUrl || null; }
    return {
      id: s.id,
      candidateId: s.candidate_id,
      moduleId: s.module_id,
      moduleTitle: s.course_modules?.title,
      maxScore: s.course_modules?.max_score,
      type: s.course_modules?.type,
      text: s.text,
      fileUrl,
      fileName: s.file_path ? s.file_path.split("/").pop() : null,
      score: s.score,
      feedback: s.feedback,
      status: s.status,
      submittedAt: s.submitted_at,
    };
  }));

  const byCand = {};
  (enrolls || []).forEach((e) => (byCand[e.candidate_id] = { candidateId: e.candidate_id, name: e.profiles?.full_name || "Candidate", email: e.profiles?.email, overall: e.overall_score, released: e.result_released, graded: 0, submitted: 0 }));
  submissions.forEach((s) => {
    byCand[s.candidateId] = byCand[s.candidateId] || { candidateId: s.candidateId, name: "Candidate", graded: 0, submitted: 0 };
    byCand[s.candidateId].submitted += 1;
    if (s.status === "graded") byCand[s.candidateId].graded += 1;
  });

  return NextResponse.json({ course: { id: course.id, title: course.title }, roster: Object.values(byCand), submissions, totalMax: await totalMax(admin, courseId) });
}

// POST /api/admin/training { action, ... }
//   grade:   { submissionId, score, feedback }
//   release: { candidateId, courseId }
export async function POST(request) {
  const g = await requireAdmin();
  if (g.error) return NextResponse.json({ error: g.error }, { status: g.status });
  const { me, admin } = g;

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const action = body?.action;

  if (action === "grade") {
    const { submissionId, score, feedback } = body;
    if (!submissionId || score == null) return NextResponse.json({ error: "submissionId and score required" }, { status: 400 });
    const { data: sub } = await admin.from("submissions").select("id, module_id, course_modules:module_id(max_score)").eq("id", submissionId).maybeSingle();
    if (!sub) return NextResponse.json({ error: "Unknown submission" }, { status: 404 });
    const max = Number(sub.course_modules?.max_score) || 0;
    const sc = Math.max(0, Math.min(max || 100, Math.round(Number(score))));
    const { error } = await admin.from("submissions").update({ score: sc, feedback: feedback || null, status: "graded", graded_by: me.id, graded_at: new Date().toISOString() }).eq("id", submissionId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, score: sc });
  }

  if (action === "release") {
    const { candidateId, courseId } = body;
    if (!candidateId || !courseId) return NextResponse.json({ error: "candidateId and courseId required" }, { status: 400 });
    const max = await totalMax(admin, courseId);
    const { data: subs } = await admin.from("submissions").select("score, status, course_modules:module_id(type, max_score)").eq("candidate_id", candidateId).eq("course_id", courseId);
    const earned = (subs || []).filter((s) => s.status === "graded" && ["assignment", "test", "quiz"].includes(s.course_modules?.type)).reduce((a, s) => a + (Number(s.score) || 0), 0);
    const overall = max > 0 ? Math.round((earned / max) * 100) : null;
    const { error } = await admin.from("enrollments").upsert(
      { candidate_id: candidateId, course_id: courseId, overall_score: overall, result_released: true, released_at: new Date().toISOString() },
      { onConflict: "candidate_id,course_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", candidateId).single();
    const { data: course } = await admin.from("specific_courses").select("title").eq("id", courseId).maybeSingle();
    const msg = `Your results for "${course?.title || "your course"}" are ready. Overall score: ${overall == null ? "—" : overall + "%"}. Sign in to see your grades and feedback.`;
    await admin.from("notifications").insert({ user_id: candidateId, title: "Course results released", body: msg, read: false });
    await sendEmail({ to: prof?.email, subject: "NexIT-Africa — your course results are ready", text: `Hi ${prof?.full_name || "there"},\n\n${msg}\n\n— The NexIT-Africa team` });
    return NextResponse.json({ ok: true, overall });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
