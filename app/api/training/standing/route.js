import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const GRADABLE = ["assignment", "test", "quiz"];

// GET /api/training/standing — the signed-in candidate's training standing:
// one entry per course they have access to, with progress (completed vs
// remaining modules), status, and released overall scores, plus roll-up stats.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Candidates only" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Which roles has the candidate purchased specific training for?
  const { data: access } = await admin.from("training_access").select("role_key").eq("candidate_id", me.id);
  const roleKeys = [...new Set((access || []).map((a) => a.role_key))];
  if (roleKeys.length === 0) {
    return NextResponse.json({ courses: [], stats: emptyStats() });
  }

  const [{ data: courses }, { data: enrolls }, { data: mods }, { data: subs }] = await Promise.all([
    admin.from("specific_courses").select("id, title, level, role_key").in("role_key", roleKeys).order("sort", { ascending: true }),
    admin.from("enrollments").select("course_id, overall_score, result_released, released_at").eq("candidate_id", me.id),
    admin.from("course_modules").select("id, course_id, type"),
    admin.from("submissions").select("module_id, course_id, status").eq("candidate_id", me.id),
  ]);

  const courseIds = new Set((courses || []).map((c) => c.id));
  const enrByCourse = {};
  (enrolls || []).forEach((e) => (enrByCourse[e.course_id] = e));

  // Count modules per course.
  const modCount = {};   // course_id → { total, gradable }
  (mods || []).forEach((m) => {
    if (!courseIds.has(m.course_id)) return;
    const c = (modCount[m.course_id] = modCount[m.course_id] || { total: 0, gradable: 0 });
    c.total += 1;
    if (GRADABLE.includes(m.type)) c.gradable += 1;
  });

  // Count this candidate's submissions per course.
  const subCount = {};   // course_id → { submitted, graded, modules:Set }
  (subs || []).forEach((s) => {
    if (!courseIds.has(s.course_id)) return;
    const c = (subCount[s.course_id] = subCount[s.course_id] || { submitted: 0, graded: 0 });
    c.submitted += 1;
    if (s.status === "graded") c.graded += 1;
  });

  const out = (courses || []).map((c) => {
    const mc = modCount[c.id] || { total: 0, gradable: 0 };
    const sc = subCount[c.id] || { submitted: 0, graded: 0 };
    const enr = enrByCourse[c.id];
    const released = !!enr?.result_released;

    // Progress is measured over gradable modules (the deliverables). If a
    // course has no gradable modules, it's self-paced reading/video.
    const totalGradable = mc.gradable;
    const done = Math.min(sc.submitted, totalGradable);
    const remaining = Math.max(totalGradable - done, 0);

    let status, statusLabel;
    if (released) { status = "released"; statusLabel = "Results released"; }
    else if (totalGradable > 0 && done >= totalGradable) { status = "completed"; statusLabel = "Completed — awaiting results"; }
    else if (sc.submitted > 0) { status = "in_progress"; statusLabel = "In progress"; }
    else { status = "not_started"; statusLabel = totalGradable === 0 ? "Self-paced" : "Not started"; }

    const pct = totalGradable > 0 ? Math.round((done / totalGradable) * 100) : (status === "not_started" ? 0 : 100);

    return {
      id: c.id,
      title: c.title,
      level: c.level,
      modules: mc.total,
      gradable: totalGradable,
      completed: done,
      remaining,
      pct,
      status,
      statusLabel,
      overallScore: released ? (enr?.overall_score ?? null) : null,
      releasedAt: released ? (enr?.released_at || null) : null,
    };
  });

  // Roll-up stats.
  const stats = {
    totalCourses: out.length,
    completedCourses: out.filter((c) => c.status === "completed" || c.status === "released").length,
    inProgressCourses: out.filter((c) => c.status === "in_progress").length,
    remainingCourses: out.filter((c) => c.status === "not_started" || c.status === "in_progress").length,
    releasedCourses: out.filter((c) => c.status === "released").length,
    avgScore: avg(out.filter((c) => c.overallScore != null).map((c) => Number(c.overallScore))),
  };

  return NextResponse.json({ courses: out, stats });
}

function emptyStats() {
  return { totalCourses: 0, completedCourses: 0, inProgressCourses: 0, remainingCourses: 0, releasedCourses: 0, avgScore: null };
}
function avg(arr) {
  if (!arr.length) return null;
  return Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10;
}
