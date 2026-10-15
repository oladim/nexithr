import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { inspectCv, cleanFileName, extOf, CV_MAX_BYTES, CV_TYPES } from "@/lib/fileSafety";
import { alertAdmins } from "@/lib/adminAlert";
import { ROLE_LABELS } from "@/lib/db";
import { cvPolicy, trashFiles, purgeStorageTrash, deleteCvRows } from "@/lib/cvStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAILY_LIMIT = 10;
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Remote"];
const INCOMING = (uid) => `incoming/${uid}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const bad = (error, status = 400, extra) => NextResponse.json({ error, ...extra }, { status });

/**
 * Secure CV upload, in two steps so large files never pass through the
 * serverless function body limit and nothing unchecked is ever filed:
 *
 *   POST { step: "start", name, size }
 *     → checks the candidate, role, file type, size and daily limit, then
 *       returns a one-time signed upload slot in a private quarantine folder
 *       ("incoming/<uid>/…") that no one can read.
 *   (browser uploads the file straight to that slot)
 *   POST { step: "finish", path, name, industry, jobType }
 *     → downloads the file, checks the real bytes (PDF / DOCX only, no
 *       scripts, macros, embedded files, encryption; must open and parse
 *       within limits), stores a clean copy under "<uid>/<random>.<ext>" with
 *       a fixed content type, deletes the quarantined original and files the
 *       CV record for the candidate's active role. Rejected files are deleted.
 */
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return bad("Please sign in again.", 401);
  if (me.role !== "candidate") return bad("Only candidates can upload a CV.", 403);
  let body;
  try { body = await request.json(); } catch { return bad("Invalid request."); }
  const admin = getServiceSupabase();
  if (!admin) return bad("Uploads aren't configured on the server.", 500);

  const { data: cand } = await admin.from("candidates").select("target_role").eq("id", me.id).maybeSingle();
  const roleKey = cand?.target_role;
  if (!roleKey) return bad("Choose your target role in your profile before uploading a CV.", 409);

  if (body?.step === "start") {
    const ext = extOf(body.name);
    if (ext === "doc") return bad("Old Word (.doc) files aren't accepted. Please save your CV as .docx or PDF.", 415);
    if (!CV_TYPES[ext]) return bad("Only PDF and Word (.docx) files are accepted.", 415);
    const size = Number(body.size) || 0;
    if (size <= 0) return bad("The file is empty.");
    if (size > CV_MAX_BYTES) return bad("Your CV is larger than 5 MB. Please upload a smaller file.", 413);

    const { data: role } = await admin.from("role_requirements").select("enabled").eq("role_key", roleKey).maybeSingle();
    if (role && role.enabled === false) return bad("Applications for your role are closed right now, so a CV can't be uploaded.", 409);

    const policy = await cvPolicy(admin, me.id);
    if (!policy.canUpload) return bad(policy.reason, 402, { code: "subscribe" });

    const since = new Date(Date.now() - 86400000).toISOString();
    const { count, error: logErr } = await admin.from("cv_upload_log").select("id", { count: "exact", head: true }).eq("candidate_id", me.id).gte("at", since);
    if (!logErr && (count || 0) >= DAILY_LIMIT) return bad("You've uploaded a lot of CVs today. Please try again tomorrow.", 429);
    await admin.from("cv_upload_log").insert({ candidate_id: me.id }).then(() => null, () => null);

    // Clear any abandoned quarantine uploads from earlier attempts.
    const { data: old } = await admin.storage.from("cvs").list(INCOMING(me.id), { limit: 100 });
    if (old?.length) await admin.storage.from("cvs").remove(old.map((f) => `${INCOMING(me.id)}/${f.name}`));

    const path = `${INCOMING(me.id)}/${crypto.randomUUID()}`;
    const { data, error } = await admin.storage.from("cvs").createSignedUploadUrl(path);
    if (error || !data?.token) return bad(`Couldn't start the upload: ${error?.message || "storage unavailable"}`, 500);
    return NextResponse.json({ ok: true, path, token: data.token, contentType: CV_TYPES[ext] });
  }

  if (body?.step === "finish") {
    const path = String(body.path || "");
    const [, uid, id] = path.split("/");
    if (!path.startsWith(`${INCOMING(me.id)}/`) || uid !== me.id || !UUID.test(id || "") || path.split("/").length !== 3) {
      return bad("Invalid upload.");
    }
    const { data: blob, error: dlErr } = await admin.storage.from("cvs").download(path);
    if (dlErr || !blob) return bad("We didn't receive the file. Please try again.", 400);
    const buf = Buffer.from(await blob.arrayBuffer());
    const removeIncoming = () => admin.storage.from("cvs").remove([path]).catch(() => null);

    let check;
    try { check = await inspectCv(buf, body.name); } catch { check = { ok: false, reason: "We couldn't check this file. Please upload a PDF." }; }
    if (!check.ok) { await removeIncoming(); return bad(check.reason, 422, { code: check.code }); }

    const finalPath = `${me.id}/${crypto.randomUUID()}.${check.type}`;
    const { error: upErr } = await admin.storage.from("cvs").upload(finalPath, buf, { contentType: check.contentType, upsert: false });
    await removeIncoming();
    if (upErr) return bad(`Couldn't store the file: ${upErr.message}`, 500);

    // Policy re-checked at the end too (the AI interview may have started meanwhile).
    const policy = await cvPolicy(admin, me.id);
    if (!policy.canUpload) { await trashFiles(admin, [finalPath]); return bad(policy.reason, 402, { code: "subscribe" }); }

    const fileName = cleanFileName(body.name, check.type);
    const industry = String(body.industry || "").replace(/[^\p{L}\p{N} &,./()-]/gu, "").slice(0, 60) || null;
    const jobType = JOB_TYPES.includes(body.jobType) ? body.jobType : "Full-time";
    const cols = "id, file_name, file_path, industry, job_type, status, review_note, uploaded_at, revision, previous_status, previous_note";

    // ONE CV per role: a new upload replaces the one on record (same row, so
    // the admin queue never shows old versions); the old file is deleted.
    const { data: existing } = await admin.from("cvs").select("*").eq("candidate_id", me.id)
      .or(`role_key.eq.${roleKey},role_key.is.null`).order("uploaded_at", { ascending: false });
    const current = (existing || [])[0] || null;
    const now = new Date().toISOString();
    const fresh = {
      file_name: fileName, file_path: finalPath, industry, job_type: jobType, role_key: roleKey,
      status: "Pending review", review_note: null, uploaded_at: now,
      suggested_role: null, original_role: null, level_response: null, level_responded_at: null,
    };
    let cv, err;
    if (current) {
      ({ data: cv, error: err } = await admin.from("cvs").update({
        ...fresh,
        revision: (current.revision || 1) + 1,
        previous_status: current.status,
        previous_note: current.review_note || null,
        resubmitted_at: now,
      }).eq("id", current.id).select(cols).single());
    } else {
      ({ data: cv, error: err } = await admin.from("cvs").insert({ candidate_id: me.id, ...fresh }).select(cols).single());
    }
    if (err) { await trashFiles(admin, [finalPath]); return bad(err.message, 500); }
    // Remove the replaced file and any stray older versions for this role.
    await trashFiles(admin, [current?.file_path].filter((p) => p && p !== finalPath));
    const strays = (existing || []).slice(1);
    if (strays.length) await deleteCvRows(admin, strays);
    purgeStorageTrash(admin, 50).catch(() => null);

    // New CV → a fresh step for reminders.
    await admin.from("candidates").update({ nudge_key: null, nudge_count: 0 }).eq("id", me.id).then(() => null, () => null);

    const who = me.full_name || me.email || "A candidate";
    const resub = !!current;
    await alertAdmins(admin, {
      key: `cv:${cv.id}:${cv.revision || 1}`,
      category: "cvs",
      subject: `${resub ? "Updated CV" : "CV"} awaiting review — ${who}`,
      summary: resub
        ? `${who} uploaded a new version of their CV (v${cv.revision}) after "${current.status}". It replaces the previous one and needs reviewing again.${policy.started ? " Their AI interview had already started." : ""}`
        : `${who} uploaded a CV. It needs to be approved before they can take the AI interview.`,
      details: [["Candidate", who], ["Email", me.email || me.authEmail || ""], ["Target role", ROLE_LABELS[roleKey] || roleKey], ["File", fileName], ["Checked", `${check.type.toUpperCase()}${check.pages ? `, ${check.pages} page(s)` : ""}${check.scanned ? " — little or no text (scanned?)" : ""}`]],
      cta: { label: "Review CVs", path: "/admin/cv-reviews" },
    }).catch(() => null);

    return NextResponse.json({
      ok: true,
      cv: { name: cv.file_name, uploadedAt: cv.uploaded_at, industry: cv.industry, jobType: cv.job_type, status: cv.status, path: cv.file_path, reviewNote: null, revision: cv.revision || 1 },
      replaced: !!current,
      warning: check.scanned ? "Your CV was saved, but we could hardly read any text in it — it may be a scanned image. A text-based PDF or .docx gives the AI interview much more to work with." : null,
    });
  }

  return bad("Unknown step.");
}

// GET — what the candidate may do with their CV right now.
export async function GET() {
  const me = await getSessionProfile();
  if (!me || me.role !== "candidate") return NextResponse.json({ canUpload: true, canDelete: true });
  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ canUpload: true, canDelete: true });
  return NextResponse.json(await cvPolicy(admin, me.id));
}

// DELETE — the candidate removes the CV for their active role. Allowed only
// until the AI interview (or any later stage) has started for that role.
export async function DELETE() {
  const me = await getSessionProfile();
  if (!me) return bad("Please sign in again.", 401);
  if (me.role !== "candidate") return bad("Only candidates can do this.", 403);
  const admin = getServiceSupabase();
  if (!admin) return bad("Server not configured.", 500);
  const { activeRole, pipelineStarted } = await import("@/lib/cvStore");
  const roleKey = await activeRole(admin, me.id);
  if (await pipelineStarted(admin, me.id)) {
    return bad("Your AI interview for this role has already started, so your CV is now part of your assessment and can't be deleted. Contact support if something is wrong with it.", 409);
  }
  let q = admin.from("cvs").select("id, file_path").eq("candidate_id", me.id);
  if (roleKey && /^[a-z0-9-]{1,80}$/.test(roleKey)) q = q.or(`role_key.eq.${roleKey},role_key.is.null`);
  let { data: rows, error } = await q;
  if (error) ({ data: rows } = await admin.from("cvs").select("id, file_path").eq("candidate_id", me.id));
  if (!rows?.length) return bad("There's no CV to delete.", 404);
  const r = await deleteCvRows(admin, rows);
  if (r.error) return bad(r.error, 500);
  return NextResponse.json({ ok: true, deleted: r.deleted });
}
