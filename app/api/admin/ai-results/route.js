import { NextResponse } from "next/server";
import { getSessionAccess } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { hasPerm } from "@/lib/permissions";
import { loadSettings, ROLE_LABELS } from "@/lib/db";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function guard() {
  const access = await getSessionAccess();
  if (!access) return { res: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  if (access.role !== "admin" || !hasPerm(access, "ai_results")) return { res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  const admin = getServiceSupabase();
  if (!admin) return { res: NextResponse.json({ error: "Server not configured" }, { status: 500 }) };
  return { access, admin };
}

// GET /api/admin/ai-results?view=pending|all
// NOTE: ai_interviews.candidate_id references candidates(id), not profiles(id),
// so names are looked up separately. (Embedding `profiles:candidate_id(...)`
// failed silently, which is why the queue always looked empty.)
export async function GET(request) {
  const { admin, res } = await guard();
  if (res) return res;
  const view = new URL(request.url).searchParams.get("view") || "pending";

  let q = admin
    .from("ai_interviews")
    .select("candidate_id, attempts, last_score, band, passed, feedback, breakdown, suggested_training, updated_at, status, confirmed_at, confirmed_by")
    .not("last_score", "is", null)
    .order("updated_at", { ascending: view === "pending" })
    .limit(300);
  if (view === "pending") q = q.eq("status", "pending_review");

  const [{ data, error }, { count: pendingCount }, settings] = await Promise.all([
    q,
    admin.from("ai_interviews").select("candidate_id", { count: "exact", head: true }).eq("status", "pending_review"),
    loadSettings(admin),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = [...new Set((data || []).flatMap((r) => [r.candidate_id, r.confirmed_by]).filter(Boolean))];
  const [{ data: profs }, { data: cands }] = await Promise.all([
    ids.length ? admin.from("profiles").select("id, full_name, email").in("id", ids) : { data: [] },
    data?.length ? admin.from("candidates").select("id, target_role").in("id", data.map((r) => r.candidate_id)) : { data: [] },
  ]);
  const P = Object.fromEntries((profs || []).map((p) => [p.id, p]));
  const C = Object.fromEntries((cands || []).map((c) => [c.id, c]));

  const rows = (data || []).map((r) => ({
    candidateId: r.candidate_id,
    name: P[r.candidate_id]?.full_name || "Candidate",
    email: P[r.candidate_id]?.email || "",
    role: ROLE_LABELS[C[r.candidate_id]?.target_role] || C[r.candidate_id]?.target_role || "",
    attempts: r.attempts,
    score: r.last_score,
    band: r.band,
    passed: r.passed,
    summary: r.feedback,
    breakdown: r.breakdown,
    training: Array.isArray(r.suggested_training) ? r.suggested_training.length : 0,
    status: r.status,
    at: r.updated_at,
    confirmedAt: r.confirmed_at,
    confirmedBy: P[r.confirmed_by]?.full_name || null,
  }));
  return NextResponse.json({ rows, pending: view === "pending" ? rows : undefined, pendingCount: pendingCount || 0, holdOn: !!settings.ai_result_requires_approval });
}

// POST /api/admin/ai-results { candidateId, action: "release" | "override_ready" }
export async function POST(request) {
  const { access, admin, res } = await guard();
  if (res) return res;

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const { candidateId, action } = body || {};
  if (!candidateId || !["release", "override_ready"].includes(action)) {
    return NextResponse.json({ error: "candidateId and a valid action are required" }, { status: 400 });
  }

  const patch = { status: "released", confirmed_by: access.id, confirmed_at: new Date().toISOString() };
  if (action === "override_ready") { patch.passed = true; patch.band = "ready"; }

  const { data: updated, error } = await admin.from("ai_interviews").update(patch).eq("candidate_id", candidateId).select("candidate_id");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!updated?.length) return NextResponse.json({ error: "No AI interview found for this candidate" }, { status: 404 });

  const { data: prof } = await admin.from("profiles").select("email, full_name").eq("id", candidateId).maybeSingle();
  await notifyUser(admin, {
    userId: candidateId,
    email: prof?.email,
    name: prof?.full_name,
    title: "Your readiness report is ready",
    body: action === "override_ready"
      ? "A NexIT reviewer has confirmed your AI interview and marked you Ready. You can now book your Professional interview."
      : "A NexIT reviewer has confirmed your AI interview. Open your report to see your results and personalised training plan.",
    cta: { label: "Open my report", path: "/dashboard/interview/ai" },
  }).catch(() => {});

  return NextResponse.json({ ok: true, action });
}
