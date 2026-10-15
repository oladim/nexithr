/**
 * CV records per role — SERVER ONLY (pass the service-role client).
 *
 * A candidate can pursue several roles (candidate_tracks); each role has its
 * own CV. "The current CV" is always the newest one for the ACTIVE role
 * (candidates.target_role). Rows from before migration 0037 have no role_key
 * and count for whichever role is active.
 */

const SAFE_KEY = /^[a-z0-9-]{1,80}$/;

// Newest CV for (candidate, role). Falls back to "newest CV" before 0037.
export async function currentCv(admin, uid, roleKey, cols = "*") {
  let q = admin.from("cvs").select(cols).eq("candidate_id", uid);
  if (roleKey && SAFE_KEY.test(roleKey)) q = q.or(`role_key.eq.${roleKey},role_key.is.null`);
  let { data, error } = await q.order("uploaded_at", { ascending: false }).limit(1).maybeSingle();
  if (error && /role_key/.test(error.message || "")) {
    ({ data } = await admin.from("cvs").select(cols).eq("candidate_id", uid).order("uploaded_at", { ascending: false }).limit(1).maybeSingle());
  }
  return data || null;
}

// The candidate's active role.
export async function activeRole(admin, uid) {
  const { data } = await admin.from("candidates").select("target_role").eq("id", uid).maybeSingle();
  return data?.target_role || null;
}

// Newest CV for the candidate's active role.
export async function activeCv(admin, uid, cols = "*") {
  return currentCv(admin, uid, await activeRole(admin, uid), cols);
}

// Has the AI interview (or any later stage) started for the active role?
export async function pipelineStarted(admin, uid) {
  const [{ data: ai }, { count: iv }] = await Promise.all([
    admin.from("ai_interviews").select("attempts").eq("candidate_id", uid).maybeSingle(),
    admin.from("interviews").select("id", { count: "exact", head: true }).eq("candidate_id", uid),
  ]);
  return (ai?.attempts || 0) > 0 || (iv || 0) > 0;
}

// Delete CV rows and their stored files.
export async function deleteCvRows(admin, rows) {
  const list = (rows || []).filter(Boolean);
  if (!list.length) return { deleted: 0 };
  const paths = list.map((r) => r.file_path).filter(Boolean);
  if (paths.length) await admin.storage.from("cvs").remove(paths).catch(() => null);
  const { error } = await admin.from("cvs").delete().in("id", list.map((r) => r.id));
  if (error) return { error: error.message };
  return { deleted: list.length };
}

// Is the candidate's annual subscription active?
export async function isSubscribed(admin, uid) {
  const { data } = await admin.from("candidates").select("subscription_until").eq("id", uid).maybeSingle();
  return !!data?.subscription_until && new Date(data.subscription_until).getTime() > Date.now();
}

/**
 * What the candidate may do with the CV for their ACTIVE role:
 *   - before the AI interview starts: replace or delete freely;
 *   - after it starts: the CV is part of their assessment — it can't be
 *     deleted, and only subscribers can replace it (the new CV goes back to
 *     the review queue).
 */
export async function cvPolicy(admin, uid) {
  const [started, subscribed, cv] = await Promise.all([pipelineStarted(admin, uid), isSubscribed(admin, uid), activeCv(admin, uid, "id")]);
  return {
    started,
    subscribed,
    hasCv: !!cv,
    // No CV on record (e.g. removed by an admin) → anyone may upload one.
    canUpload: !started || subscribed || !cv,
    canDelete: !started,
    reason: started && !subscribed && cv
      ? "Your AI interview has started, so your CV is now part of your assessment. Uploading a new CV from this point is included in the annual subscription — your new CV is then reviewed again by our team."
      : null,
  };
}

// Queue files for removal and delete whatever is queued (best effort).
export async function trashFiles(admin, paths, bucket = "cvs") {
  const list = (paths || []).filter(Boolean);
  if (!list.length) return;
  const { error } = await admin.storage.from(bucket).remove(list);
  if (error) await admin.from("storage_trash").upsert(list.map((path) => ({ bucket, path })), { onConflict: "bucket,path", ignoreDuplicates: true }).then(() => null, () => null);
}
export async function purgeStorageTrash(admin, limit = 200) {
  const { data } = await admin.from("storage_trash").select("id, bucket, path").order("id").limit(limit);
  if (!data?.length) return 0;
  const byBucket = {};
  data.forEach((r) => { (byBucket[r.bucket] = byBucket[r.bucket] || []).push(r); });
  let n = 0;
  for (const [bucket, rows] of Object.entries(byBucket)) {
    const { error } = await admin.storage.from(bucket).remove(rows.map((r) => r.path));
    if (!error) { await admin.from("storage_trash").delete().in("id", rows.map((r) => r.id)); n += rows.length; }
  }
  return n;
}
