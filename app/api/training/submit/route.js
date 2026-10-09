import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { alertAdmins } from "@/lib/adminAlert";

export const runtime = "nodejs";

// POST /api/training/submit { courseId, moduleId, text, filePath }
// Create or update the candidate's submission for an assignment/test module.
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "candidate") return NextResponse.json({ error: "Candidates only" }, { status: 403 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { courseId, moduleId, text, filePath, answers } = body || {};
  if (!courseId || !moduleId) return NextResponse.json({ error: "courseId and moduleId required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // Validate: module belongs to course, is gradable, and candidate has access.
  const { data: mod } = await admin.from("course_modules").select("id, course_id, type, max_score, questions, approved").eq("id", moduleId).maybeSingle();
  if (!mod || mod.course_id !== courseId || !mod.approved) return NextResponse.json({ error: "Unknown module" }, { status: 404 });
  if (!["assignment", "test", "quiz"].includes(mod.type)) return NextResponse.json({ error: "This module isn't submittable." }, { status: 400 });

  const { data: course } = await admin.from("specific_courses").select("role_key, approved").eq("id", courseId).maybeSingle();
  if (!course?.approved) return NextResponse.json({ error: "This course isn't available yet." }, { status: 404 });
  const { data: access } = await admin.from("training_access").select("role_key").eq("candidate_id", me.id).eq("role_key", course?.role_key).maybeSingle();
  if (!access) return NextResponse.json({ error: "No access to this course." }, { status: 403 });

  // Don't overwrite a graded submission.
  const { data: existing } = await admin.from("submissions").select("id, status").eq("candidate_id", me.id).eq("module_id", moduleId).maybeSingle();
  if (existing?.status === "graded") return NextResponse.json({ error: "This has already been submitted/graded." }, { status: 400 });

  // ---- Quiz: auto-grade on the server (answers never leave the server) ----
  if (mod.type === "quiz") {
    const qs = Array.isArray(mod.questions) ? mod.questions : [];
    if (qs.length === 0) return NextResponse.json({ error: "This quiz has no questions yet." }, { status: 400 });
    const picks = Array.isArray(answers) ? answers : [];
    let correct = 0;
    qs.forEach((q, i) => { if (Number(picks[i]) === Number(q.answer)) correct += 1; });
    const total = qs.length;
    const max = Number(mod.max_score) || 0;
    const score = max > 0 ? Math.round((correct / total) * max) : correct;
    const row = {
      candidate_id: me.id, course_id: courseId, module_id: moduleId,
      text: JSON.stringify({ answers: picks, correct, total }),
      status: "graded", score, graded_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    };
    const { error } = await admin.from("submissions").upsert(row, { onConflict: "candidate_id,module_id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, auto: true, correct, total, score, maxScore: max });
  }

  // ---- Assignment / test: text and/or file, graded later by a tutor ----
  if (!text?.trim() && !filePath) return NextResponse.json({ error: "Add an answer or attach a file." }, { status: 400 });
  if (filePath && !String(filePath).startsWith(`${me.id}/`)) {
    return NextResponse.json({ error: "Invalid file path." }, { status: 400 });
  }
  const row = {
    candidate_id: me.id, course_id: courseId, module_id: moduleId,
    text: text || null, file_path: filePath || null,
    status: "submitted", submitted_at: new Date().toISOString(),
  };
  const { error } = await admin.from("submissions").upsert(row, { onConflict: "candidate_id,module_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const { data: courseRow } = await admin.from("specific_courses").select("title").eq("id", courseId).maybeSingle();
  await alertAdmins(admin, {
    key: `submit:${me.id}:${moduleId}:${row.submitted_at}`,
    category: "training",
    subject: `${mod.type === "test" ? "Test" : "Assignment"} submitted for grading — ${me.full_name || "candidate"}`,
    summary: `${me.full_name || "A candidate"} submitted work that needs grading.`,
    details: [["Candidate", `${me.full_name || "—"} (${me.email || me.authEmail || ""})`], ["Course", courseRow?.title], ["Max score", mod.max_score ? String(mod.max_score) : null]],
    cta: { label: "Grade submissions", path: `/admin/specific-training/${courseId}` },
  });
  return NextResponse.json({ ok: true });
}
