import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { loadSettings, ROLE_LABELS } from "@/lib/db";
import { nextStep } from "@/lib/nextStep";
import { baseKeyOf } from "@/lib/roleCatalog";
import { notifyUser } from "@/lib/notify";
import { alertAdmins } from "@/lib/adminAlert";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SAFE_KEY = /^[a-z0-9-]{1,80}$/;
const bad = (error, status = 400) => NextResponse.json({ error }, { status });

/**
 * My roles — a candidate's role tracks.
 *
 * GET → { active, tracks: [{ roleKey, title, active, step, cvStatus }], max, subscribed, canAdd, reason }
 * POST { action: "add",    roleKey }  subscribers only, up to the admin-set limit
 *                                     → becomes the active role (upload its CV next)
 * POST { action: "switch", roleKey }  make another of your roles active
 * POST { action: "remove", roleKey }  drop an inactive role that hasn't started
 *
 * Each role has its own CV, AI interview, Professional/HR interviews and
 * certificate. Switching archives the current role's progress and restores
 * the other's (database function switch_track), so nothing is lost.
 */
async function context() {
  const me = await getSessionProfile();
  if (!me) return { res: bad("Please sign in again.", 401) };
  if (me.role !== "candidate") return { res: bad("Candidates only.", 403) };
  const admin = getServiceSupabase();
  if (!admin) return { res: bad("Server not configured.", 500) };
  const [{ data: cand }, settings, { data: tracks, error }] = await Promise.all([
    admin.from("candidates").select("target_role, subscription_until").eq("id", me.id).maybeSingle(),
    loadSettings(admin),
    admin.from("candidate_tracks").select("role_key, archived, created_at").eq("candidate_id", me.id).order("created_at"),
  ]);
  if (error) return { res: bad("Multiple roles need database migration 0037. Ask an admin to run it.", 503) };
  const subscribed = !!cand?.subscription_until && new Date(cand.subscription_until).getTime() > Date.now();
  const max = Math.max(1, Number(settings.max_roles_per_candidate ?? 3));
  return { me, admin, cand, tracks: tracks || [], subscribed, max };
}

// Has the candidate actually applied for any role yet (a CV filed, or the AI
// interview / an interview started)? Until they have, choosing a role — even
// a different one — is free: it simply becomes (or replaces) their role.
async function appliedRoles(admin, uid, cand, tracks) {
  const [{ data: cvs }, { data: ai }, { count: iv }] = await Promise.all([
    admin.from("cvs").select("role_key").eq("candidate_id", uid),
    admin.from("ai_interviews").select("attempts").eq("candidate_id", uid).maybeSingle(),
    admin.from("interviews").select("id", { count: "exact", head: true }).eq("candidate_id", uid),
  ]);
  const set = new Set();
  (cvs || []).forEach((c) => set.add(c.role_key || cand?.target_role));
  if (cand?.target_role && ((ai?.attempts || 0) > 0 || (iv || 0) > 0)) set.add(cand.target_role);
  tracks.forEach((t) => {
    const st = archivedState(t.archived);
    if (st.ai.attempts > 0 || st.interviews.length > 0) set.add(t.role_key);
  });
  set.delete(null); set.delete(undefined);
  return set;
}

function archivedState(arch) {
  const a = arch || {};
  const stages = { Professional: { attempts: 0, passed: false }, HR: { attempts: 0, passed: false } };
  (a.stages || []).forEach((s) => {
    const cur = stages[s.stage]; if (!cur) return;
    cur.attempts = Math.max(cur.attempts, s.attempt_no || 1); cur.passed = cur.passed || !!s.passed;
  });
  return {
    ai: a.ai ? { attempts: a.ai.attempts || 0, passed: !!a.ai.passed, status: a.ai.status || "released" } : { attempts: 0, passed: false, status: "released" },
    stages,
    interviews: (a.interviews || []).map((i) => ({ type: i.type, status: i.status, date: i.scheduled_date, time: i.scheduled_time })),
  };
}

export async function GET() {
  const c = await context();
  if (c.res) return c.res;
  const { me, admin, cand, subscribed, max } = c;
  let tracks = c.tracks;
  if (cand?.target_role && !tracks.some((t) => t.role_key === cand.target_role)) tracks = [{ role_key: cand.target_role, archived: null }, ...tracks];
  const keys = tracks.map((t) => t.role_key);

  const [{ data: reqs }, { data: cvs }, { data: ai }, { data: stages }, { data: ivs }, { data: certs }] = await Promise.all([
    admin.from("role_requirements").select("role_key, title, level, area_key, enabled").in("role_key", keys.length ? keys : ["-"]),
    admin.from("cvs").select("role_key, status, review_note, uploaded_at").eq("candidate_id", me.id).order("uploaded_at", { ascending: false }),
    admin.from("ai_interviews").select("attempts, passed, status").eq("candidate_id", me.id).maybeSingle(),
    admin.from("stage_attempts").select("stage, attempt_no, passed").eq("candidate_id", me.id),
    admin.from("interviews").select("type, status, scheduled_date, scheduled_time").eq("candidate_id", me.id),
    admin.from("certificates").select("id, role_key, revoked").eq("candidate_id", me.id),
  ]);
  const R = Object.fromEntries((reqs || []).map((r) => [r.role_key, r]));
  const live = archivedState({ ai, stages, interviews: ivs });

  const out = tracks.map((t) => {
    const active = t.role_key === cand?.target_role;
    const cv = (cvs || []).find((v) => v.role_key === t.role_key || (!v.role_key && active)) || null;
    const st = active ? live : archivedState(t.archived);
    const title = R[t.role_key]?.title || ROLE_LABELS[t.role_key] || t.role_key;
    const step = nextStep({ roleKey: t.role_key, roleTitle: title, cv: cv ? { status: cv.status, reviewNote: cv.review_note } : null, ...st });
    const cert = (certs || []).find((x) => x.role_key === t.role_key && !x.revoked);
    return { roleKey: t.role_key, title, level: R[t.role_key]?.level || null, area: R[t.role_key]?.area_key || null, open: R[t.role_key]?.enabled !== false, active, cvStatus: cv?.status || null, step: { key: step.key, title: step.title, stage: step.step, of: step.of }, certificateId: cert?.id || null, started: (st.ai.attempts || 0) > 0 || st.interviews.length > 0 };
  });
  out.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));

  const applied = await appliedRoles(admin, me.id, cand, c.tracks);
  // Not applied for any role yet → picking a role is free (it replaces the
  // unapplied one). A subscription is only needed for a SECOND role.
  const firstRoleFree = applied.size === 0;
  const reason = firstRoleFree ? null : !subscribed ? "subscribe" : out.length >= max ? "limit" : null;
  return NextResponse.json({ active: cand?.target_role || null, tracks: out, max, subscribed, canAdd: !reason, reason, firstRoleFree });
}

export async function POST(request) {
  const c = await context();
  if (c.res) return c.res;
  const { me, admin, cand, tracks, subscribed, max } = c;
  let body;
  try { body = await request.json(); } catch { return bad("Invalid request."); }
  const action = body?.action;
  const roleKey = String(body?.roleKey || "");
  if (!SAFE_KEY.test(roleKey)) return bad("Choose a role.");

  const switchTo = async (key) => {
    const { error } = await admin.rpc("switch_track", { cid: me.id, new_role: key });
    if (!error) return null;
    if (/OPEN_INTERVIEW/.test(error.message)) return "You have an interview booked for your current role. Attend or cancel it before switching roles.";
    if (/NO_TRACK/.test(error.message)) return "That role isn't one of yours.";
    return error.message;
  };

  if (action === "add") {
    // First role (nothing applied for yet): free — it becomes their role,
    // replacing a role they chose but never applied for.
    const applied = await appliedRoles(admin, me.id, cand, tracks);
    if (applied.size === 0) {
      const { data: req0 } = await admin.from("role_requirements").select("role_key, title, enabled, kind").eq("role_key", roleKey).maybeSingle();
      if (!req0 || req0.enabled === false || req0.kind === "area") return bad("That role isn't open for applications.", 409);
      if (cand?.target_role === roleKey) return NextResponse.json({ ok: true, active: roleKey, title: req0.title, replaced: false });
      // Drop other never-applied tracks so the new role is their only one.
      await admin.from("candidate_tracks").delete().eq("candidate_id", me.id).neq("role_key", cand?.target_role || "-");
      const { error: upErr } = await admin.from("candidates").update({ target_role: roleKey }).eq("id", me.id);
      if (upErr) return bad(upErr.message, 409);
      return NextResponse.json({ ok: true, active: roleKey, title: req0.title, replaced: !!cand?.target_role });
    }
    if (!subscribed) return bad("Applying for more than one role is part of the annual subscription. Subscribe to add another role.", 402);
    const total = tracks.length || (cand?.target_role ? 1 : 0);
    if (total >= max) return bad(`You can pursue up to ${max} roles at a time.`, 409);
    if (tracks.some((t) => t.role_key === roleKey) || cand?.target_role === roleKey) return bad("That role is already in My roles.", 409);
    if ([...tracks.map((t) => t.role_key), cand?.target_role].some((k) => k && baseKeyOf(k) === baseKeyOf(roleKey))) {
      return bad("You already have this role at another level. A role can only be pursued at one level at a time.", 409);
    }
    const { data: req } = await admin.from("role_requirements").select("role_key, title, enabled, kind").eq("role_key", roleKey).maybeSingle();
    if (!req || req.enabled === false || req.kind === "area") return bad("That role isn't open for applications.", 409);

    // Make sure the current role is recorded as a track before adding.
    if (cand?.target_role) await admin.from("candidate_tracks").upsert({ candidate_id: me.id, role_key: cand.target_role }, { onConflict: "candidate_id,role_key", ignoreDuplicates: true });
    const { error: insErr } = await admin.from("candidate_tracks").insert({ candidate_id: me.id, role_key: roleKey });
    if (insErr) return bad(insErr.message, 500);
    const err = cand?.target_role ? await switchTo(roleKey) : (await admin.from("candidates").update({ target_role: roleKey }).eq("id", me.id)).error?.message;
    if (err) {
      await admin.from("candidate_tracks").delete().eq("candidate_id", me.id).eq("role_key", roleKey).is("archived", null);
      return bad(err, 409);
    }
    await notifyUser(admin, {
      userId: me.id, sendEmail: false,
      title: `${req.title} added to My roles`,
      body: "It's now your active role. Upload a CV tailored to this role to begin — your other roles keep their progress.",
      cta: { label: "Upload CV", path: "/dashboard/cv-upload" },
    }).catch(() => null);
    await alertAdmins(admin, {
      key: `track:${me.id}:${roleKey}`, category: "registrations",
      subject: `Candidate added a role — ${me.full_name || me.email}`,
      summary: `${me.full_name || "A candidate"} is now also applying for ${req.title}.`,
      details: [["Candidate", me.full_name || "—"], ["Email", me.email || ""], ["New role", req.title], ["Roles", String(total + 1)]],
    }).catch(() => null);
    return NextResponse.json({ ok: true, active: roleKey, title: req.title });
  }

  if (action === "switch") {
    if (cand?.target_role === roleKey) return NextResponse.json({ ok: true, active: roleKey });
    if (!tracks.some((t) => t.role_key === roleKey)) return bad("That role isn't one of yours.", 404);
    const err = await switchTo(roleKey);
    if (err) return bad(err, 409);
    return NextResponse.json({ ok: true, active: roleKey });
  }

  if (action === "remove") {
    if (cand?.target_role === roleKey) return bad("You can't remove your active role. Switch to another role first.", 409);
    const t = tracks.find((x) => x.role_key === roleKey);
    if (!t) return bad("That role isn't one of yours.", 404);
    const st = archivedState(t.archived);
    if (st.ai.attempts > 0 || st.interviews.length > 0) return bad("You've already started interviews for this role, so it can't be removed.", 409);
    const { data: rows } = await admin.from("cvs").select("id, file_path").eq("candidate_id", me.id).eq("role_key", roleKey);
    if (rows?.length) {
      const paths = rows.map((r) => r.file_path).filter(Boolean);
      if (paths.length) await admin.storage.from("cvs").remove(paths).catch(() => null);
      await admin.from("cvs").delete().in("id", rows.map((r) => r.id));
    }
    await admin.from("candidate_tracks").delete().eq("candidate_id", me.id).eq("role_key", roleKey);
    return NextResponse.json({ ok: true });
  }

  return bad("Unknown action.");
}
