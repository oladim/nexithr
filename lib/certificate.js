// Server-only helpers for the NexIT Verified Professional (N|VP) certificate.
import crypto from "crypto";
import { ROLE_LABELS } from "@/lib/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL || "https://nexitafrica.com";

export const verifyUrl = (id) => `${APP_URL.replace(/\/$/, "")}/verify/${encodeURIComponent(id)}`;

const newId = (date) => `NXA-${date.getFullYear()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

// Has this candidate passed EVERY stage (AI + Professional + HR) and been
// admitted to the board? Returns { ok, hrPassedAt }.
export async function passedAllStages(admin, candidateId) {
  const [{ data: cand }, { data: ai }, { data: stages }] = await Promise.all([
    admin.from("candidates").select("on_board, target_role").eq("id", candidateId).maybeSingle(),
    admin.from("ai_interviews").select("passed").eq("candidate_id", candidateId).maybeSingle(),
    admin.from("stage_attempts").select("stage, passed, created_at").eq("candidate_id", candidateId).eq("passed", true),
  ]);
  const pro = (stages || []).find((s) => s.stage === "Professional");
  const hr = (stages || []).filter((s) => s.stage === "HR").sort((a, b) => (a.created_at < b.created_at ? 1 : -1))[0];
  const ok = !!(cand?.on_board && ai?.passed && pro && hr);
  return { ok, hrPassedAt: hr?.created_at || null, targetRole: cand?.target_role || null };
}

// Return the candidate's certificate, issuing it on first request once they
// have passed all stages. Returns null when they aren't eligible.
export async function getOrIssueCertificate(admin, candidateId) {
  const elig = await passedAllStages(admin, candidateId);
  if (!elig.ok) return null;

  const { data: existing } = await admin.from("certificates").select("*").eq("candidate_id", candidateId).maybeSingle();
  if (existing) return existing;

  const [{ data: prof }, { data: req }] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", candidateId).maybeSingle(),
    elig.targetRole
      ? admin.from("role_requirements").select("title").eq("role_key", elig.targetRole).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  const issuedAt = elig.hrPassedAt ? new Date(elig.hrPassedAt) : new Date();
  const base = {
    candidate_id: candidateId,
    full_name: prof?.full_name || "Candidate",
    role_key: elig.targetRole,
    role_label: req?.title || ROLE_LABELS[elig.targetRole] || elig.targetRole || "Technology",
    issued_at: issuedAt.toISOString(),
  };
  // Retry on the (very unlikely) id collision; a concurrent issue for the same
  // candidate loses the unique(candidate_id) race and we read the winner back.
  for (let i = 0; i < 4; i++) {
    const { data, error } = await admin.from("certificates").insert({ id: newId(issuedAt), ...base }).select().single();
    if (data) return data;
    if (error && /candidate_id/i.test(error.message || "")) break;
  }
  const { data: again } = await admin.from("certificates").select("*").eq("candidate_id", candidateId).maybeSingle();
  return again || null;
}

export const formatIssued = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
