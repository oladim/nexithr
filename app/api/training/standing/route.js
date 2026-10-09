import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const GRADABLE = ["assignment", "test", "quiz"];

// GET /api/training/standing — everything the candidate's training dashboard
// needs, computed server-side from APPROVED courses/modules only:
//   courses  — one entry per course with progress, status and released score
//   stats    — roll-up numbers (enrolled, completed, tasks, average, …)
//   todo     — next deliverables not yet submitted (across courses)
//   recent   — latest graded work (scores shown only when visible)
//   next     — the course + task to continue with
//   access   — subscription + the roles they bought specific training for
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Candidates only" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const [{ data: accessRows }, { data: cand }] = await Promise.all([
    admin.from("training_access").select("role_key").eq("candidate_id", me.id),
    admin.from("candidates").select("subscription_until").eq("id", me.id).maybeSingle(),
  ]);
  const roleKeys = [...new Set((accessRows || []).map((a) => a.role_key))];
  const subUntil = cand?.subscription_until || null;
  const access = {
    subscribed: !!(subUntil && new Date(subUntil) > new Date()),
    subscriptionUntil: subUntil,
    trainingRoles: roleKeys,
  };

  if (roleKeys.length === 0) {
    return NextResponse.json({ courses: [], stats: emptyStats(), todo: [], recent: [], next: null, access });
  }

  const { data: courses } = await admin.from("specific_courses")
    .select("id, title, level, role_key, duration, sort").in("role_key", roleKeys).eq("approved", true).order("sort", { ascending: true });
  const courseIds = (courses || []).map((c) => c.id);
  if (courseIds.length === 0) {
    return NextResponse.json({ courses: [], stats: emptyStats(), todo: [], recent: [], next: null, access });
  }

  const [{ data: enrolls }, { data: mods }, { data: subs }] = await Promise.all([
    admin.from("enrollments").select("course_id, overall_score, result_released, released_at").eq("candidate_id", me.id),
    admin.from("course_modules").select("id, course_id, type, title, max_score, sort").in("course_id", courseIds).eq("approved", true).order("sort", { ascending: true }),
    admin.from("submissions").select("module_id, course_id, status, score, graded_at, submitted_at").eq("candidate_id", me.id),
  ]);

  const courseById = Object.fromEntries((courses || []).map((c) => [c.id, c]));
  const enrByCourse = Object.fromEntries((enrolls || []).map((e) => [e.course_id, e]));
  const modById = Object.fromEntries((mods || []).map((m) => [m.id, m]));
  const subByMod = Object.fromEntries((subs || []).map((s) => [s.module_id, s]));

  const out = (courses || []).map((c) => {
    const cm = (mods || []).filter((m) => m.course_id === c.id);
    const gradable = cm.filter((m) => GRADABLE.includes(m.type));
    const done = gradable.filter((m) => subByMod[m.id]).length;
    const graded = gradable.filter((m) => subByMod[m.id]?.status === "graded").length;
    const enr = enrByCourse[c.id];
    const released = !!enr?.result_released;
    const touched = cm.some((m) => subByMod[m.id]) || !!enr;

    let status, statusLabel;
    if (released) { status = "released"; statusLabel = "Results released"; }
    else if (gradable.length > 0 && done >= gradable.length) { status = "completed"; statusLabel = "Completed — awaiting results"; }
    else if (done > 0 || touched) { status = "in_progress"; statusLabel = "In progress"; }
    else { status = "not_started"; statusLabel = gradable.length === 0 ? "Self-paced" : "Not started"; }

    const pct = gradable.length > 0 ? Math.round((done / gradable.length) * 100) : (status === "not_started" ? 0 : 100);
    const nextTask = gradable.find((m) => !subByMod[m.id]) || null;
    return {
      id: c.id, title: c.title, level: c.level, duration: c.duration || null,
      modules: cm.length, gradable: gradable.length, completed: done, graded, remaining: Math.max(gradable.length - done, 0),
      pct, status, statusLabel,
      overallScore: released ? (enr?.overall_score ?? null) : null,
      releasedAt: released ? (enr?.released_at || null) : null,
      nextTask: nextTask ? { id: nextTask.id, title: nextTask.title, type: nextTask.type } : null,
    };
  });

  // To-do: unsubmitted deliverables, in course + module order.
  const todo = [];
  for (const c of out) {
    for (const m of (mods || []).filter((x) => x.course_id === c.id && GRADABLE.includes(x.type) && !subByMod[x.id])) {
      todo.push({ moduleId: m.id, courseId: c.id, course: c.title, title: m.title, type: m.type, maxScore: m.max_score || null });
    }
  }

  // Recent graded work. Quiz scores are always visible; assignment/test
  // scores only once the course results are released.
  const recent = (subs || [])
    .filter((s) => s.status === "graded" && modById[s.module_id] && courseById[s.course_id])
    .sort((a, b) => new Date(b.graded_at || b.submitted_at) - new Date(a.graded_at || a.submitted_at))
    .slice(0, 5)
    .map((s) => {
      const m = modById[s.module_id];
      const visible = m.type === "quiz" || !!enrByCourse[s.course_id]?.result_released;
      return {
        moduleId: s.module_id, courseId: s.course_id, course: courseById[s.course_id].title, title: m.title, type: m.type,
        score: visible ? Number(s.score) : null, maxScore: visible ? (m.max_score || null) : null,
        at: s.graded_at || s.submitted_at,
      };
    });

  const awaitingGrading = (subs || []).filter((s) => s.status !== "graded" && modById[s.module_id]).length;
  const tasksTotal = out.reduce((a, c) => a + c.gradable, 0);
  const tasksDone = out.reduce((a, c) => a + c.completed, 0);

  const nextCourse = out.find((c) => c.status === "in_progress" && c.nextTask) || out.find((c) => c.status === "not_started" && c.nextTask) || out.find((c) => c.status !== "released") || null;

  const stats = {
    totalCourses: out.length,
    completedCourses: out.filter((c) => c.status === "completed" || c.status === "released").length,
    inProgressCourses: out.filter((c) => c.status === "in_progress").length,
    notStartedCourses: out.filter((c) => c.status === "not_started").length,
    remainingCourses: out.filter((c) => c.status === "not_started" || c.status === "in_progress").length,
    releasedCourses: out.filter((c) => c.status === "released").length,
    avgScore: avg(out.filter((c) => c.overallScore != null).map((c) => Number(c.overallScore))),
    tasksTotal, tasksDone, awaitingGrading,
    overallPct: tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0,
  };

  return NextResponse.json({
    courses: out, stats, todo: todo.slice(0, 6), recent, access,
    next: nextCourse ? { courseId: nextCourse.id, course: nextCourse.title, pct: nextCourse.pct, task: nextCourse.nextTask } : null,
  });
}

function emptyStats() {
  return { totalCourses: 0, completedCourses: 0, inProgressCourses: 0, notStartedCourses: 0, remainingCourses: 0, releasedCourses: 0, avgScore: null, tasksTotal: 0, tasksDone: 0, awaitingGrading: 0, overallPct: 0 };
}
function avg(arr) {
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}
