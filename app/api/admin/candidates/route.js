import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { ROLE_LABELS } from "@/lib/db";

// GET /api/admin/candidates — every candidate with their interview progress.
// Admins only. Used by the Interview Manager to reset / ask to retake.
export async function GET() {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (me.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  const [{ data: profs }, { data: cands }, { data: ai }, { data: stages }] = await Promise.all([
    admin.from("profiles").select("id, full_name, email").eq("role", "candidate"),
    admin.from("candidates").select("id, target_role, on_board"),
    admin.from("ai_interviews").select("candidate_id, attempts, passed, last_score"),
    admin.from("stage_attempts").select("candidate_id, stage, passed, attempt_no"),
  ]);

  const candById = {};
  (cands || []).forEach((c) => (candById[c.id] = c));
  const aiById = {};
  (ai || []).forEach((a) => (aiById[a.candidate_id] = a));

  // Fold stage attempts → latest per (candidate, stage).
  const stageBy = {}; // id -> { Professional:{passed,attempts}, HR:{...} }
  (stages || []).forEach((s) => {
    const m = (stageBy[s.candidate_id] = stageBy[s.candidate_id] || {});
    const cur = m[s.stage] || { passed: false, attempts: 0 };
    cur.attempts = Math.max(cur.attempts, s.attempt_no || 0);
    if (s.passed) cur.passed = true;
    m[s.stage] = cur;
  });

  const rows = (profs || []).map((p) => {
    const c = candById[p.id] || {};
    const a = aiById[p.id];
    const st = stageBy[p.id] || {};
    return {
      id: p.id,
      name: p.full_name || "Candidate",
      email: p.email,
      targetRole: ROLE_LABELS[c.target_role] || c.target_role || "—",
      onBoard: !!c.on_board,
      ai: a ? { attempts: a.attempts || 0, passed: !!a.passed, lastScore: a.last_score } : { attempts: 0, passed: false, lastScore: null },
      professional: st.Professional || { passed: false, attempts: 0 },
      hr: st.HR || { passed: false, attempts: 0 },
    };
  });

  // Most-recently-active first-ish: candidates with any activity on top.
  rows.sort((x, y) => {
    const ax = x.ai.attempts + x.professional.attempts + x.hr.attempts;
    const ay = y.ai.attempts + y.professional.attempts + y.hr.attempts;
    return ay - ax || String(x.name).localeCompare(String(y.name));
  });

  return NextResponse.json({ candidates: rows });
}
