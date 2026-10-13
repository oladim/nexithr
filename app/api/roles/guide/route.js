import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import SHARED from "@/lib/interviewShared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/roles/guide?candidateId=…&stage=Professional|HR
// The interview guide for this candidate's target role-level. Staff only:
// admins, or the interviewer assigned to this candidate's booking for that
// stage. Never exposed to candidates.
export async function GET(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const url = new URL(request.url);
  const candidateId = url.searchParams.get("candidateId") || "";
  const stage = url.searchParams.get("stage") === "HR" ? "HR" : "Professional";
  if (!/^[0-9a-f-]{36}$/i.test(candidateId)) return NextResponse.json({ error: "Invalid candidate" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  if (me.role !== "admin") {
    if (me.role !== "interviewer") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { data: iv } = await admin.from("interviewers").select("kind").eq("id", me.id).maybeSingle();
    if (iv?.kind !== stage) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const { data: mine } = await admin.from("interviews").select("id").eq("candidate_id", candidateId).eq("type", stage).eq("interviewer_id", me.id).limit(1);
    if (!(mine || []).length) return NextResponse.json({ error: "You haven't been assigned to this candidate." }, { status: 403 });
  }

  const { data: cand } = await admin.from("candidates").select("target_role").eq("id", candidateId).maybeSingle();
  const roleKey = cand?.target_role;
  if (!roleKey) return NextResponse.json({ guide: null, reason: "no-role" });

  const [{ data: role }, { data: pb }] = await Promise.all([
    admin.from("role_requirements").select("title, level, focus, required_skills, responsibilities, tools, certifications, min_experience").eq("role_key", roleKey).maybeSingle(),
    admin.from("role_playbooks").select("competencies, professional_guide, hr_guide").eq("role_key", roleKey).maybeSingle(),
  ]);
  if (!pb) return NextResponse.json({ guide: null, role, reason: "no-playbook" });

  const guide = stage === "HR"
    ? {
        stage, questions: [...(pb.hr_guide?.roleScenarios || []).map((x) => ({ ...x, tag: "Role-specific" })), ...SHARED.hrCommon],
        competencies: SHARED.hrCompetencies, ratingAnchors: SHARED.ratingAnchors, notes: SHARED.hrNotes,
      }
    : {
        stage, questions: pb.professional_guide?.questions || [],
        competencies: pb.professional_guide?.competencies || pb.competencies || [],
        ratingAnchors: SHARED.ratingAnchors, notes: SHARED.professionalNotes,
      };
  return NextResponse.json({ role: { key: roleKey, ...role }, guide }, { headers: { "Cache-Control": "private, no-store" } });
}
