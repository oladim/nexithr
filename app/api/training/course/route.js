import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// GET /api/training/course?courseId= — the enrolled candidate's view of a
// course: modules (with signed material URLs), their submissions, and their
// enrollment. Scores/feedback are hidden until results are released.
export async function GET(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Candidates only" }, { status: 403 });

  const courseId = request.nextUrl?.searchParams?.get("courseId");
  if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const { data: course } = await admin.from("specific_courses").select("*").eq("id", courseId).maybeSingle();
  if (!course) return NextResponse.json({ error: "Unknown course" }, { status: 404 });

  // Access: candidate must have purchased specific training for this role.
  const { data: access } = await admin.from("training_access").select("role_key").eq("candidate_id", me.id).eq("role_key", course.role_key).maybeSingle();
  if (!access) return NextResponse.json({ error: "You don't have access to this course." }, { status: 403 });

  // Ensure an enrollment exists.
  await admin.from("enrollments").upsert({ candidate_id: me.id, course_id: courseId }, { onConflict: "candidate_id,course_id" });
  const { data: enr } = await admin.from("enrollments").select("overall_score, result_released, released_at").eq("candidate_id", me.id).eq("course_id", courseId).maybeSingle();
  const released = !!enr?.result_released;

  const { data: mods } = await admin.from("course_modules").select("*").eq("course_id", courseId).order("sort", { ascending: true });
  const { data: subs } = await admin.from("submissions").select("*").eq("candidate_id", me.id).eq("course_id", courseId);
  const subByMod = {};
  (subs || []).forEach((s) => (subByMod[s.module_id] = s));

  const modules = await Promise.all((mods || []).map(async (m) => {
    let materialUrl = null;
    if (m.file_path) {
      const { data: s } = await admin.storage.from("training").createSignedUrl(m.file_path, 3600);
      materialUrl = s?.signedUrl || null;
    }
    const sub = subByMod[m.id];
    // Quizzes auto-grade, so their score shows immediately; assignments/tests
    // only once results are released.
    const showScore = sub?.status === "graded" && (released || m.type === "quiz");
    // Quiz questions WITHOUT the correct answer.
    const quizQuestions = m.type === "quiz" && Array.isArray(m.questions)
      ? m.questions.map((q) => ({ q: q.q, options: q.options || [] }))
      : null;
    let quizResult = null;
    if (m.type === "quiz" && sub?.text) {
      try { const parsed = JSON.parse(sub.text); quizResult = { correct: parsed.correct, total: parsed.total }; } catch { /* ignore */ }
    }
    return {
      id: m.id,
      title: m.title,
      type: m.type,
      content: m.content,
      videoUrl: m.video_url,
      materialUrl,
      maxScore: m.max_score,
      questions: quizQuestions,
      submission: sub
        ? {
            status: sub.status,
            text: m.type === "quiz" ? null : sub.text,
            fileName: sub.file_path ? sub.file_path.split("/").pop() : null,
            submittedAt: sub.submitted_at,
            score: showScore ? sub.score : null,
            feedback: released && sub.status === "graded" ? sub.feedback : null,
            quizResult: showScore ? quizResult : null,
          }
        : null,
    };
  }));

  return NextResponse.json({
    course: { id: course.id, title: course.title, summary: course.summary, level: course.level },
    modules,
    enrollment: { overallScore: released ? enr?.overall_score ?? null : null, released, releasedAt: enr?.released_at || null },
  });
}
