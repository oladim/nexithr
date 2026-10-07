/**
 * Data-access layer for NexIT-Africa.
 *
 * Every function takes a Supabase client (browser or server) as its first
 * argument, so the same helpers work in client components, server components,
 * and route handlers. All reads/writes go through Row-Level Security, so a
 * signed-in user only ever touches rows they're allowed to.
 */

// ---- Candidate: full app state -------------------------------------
export async function loadCandidateState(supabase, userId) {
  const [{ data: candidate }, { data: cv }, { data: interviews }, { data: ai }, { data: stages }] =
    await Promise.all([
      supabase.from("candidates").select("*").eq("id", userId).single(),
      supabase.from("cvs").select("*").eq("candidate_id", userId).order("uploaded_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("interviews").select("*").eq("candidate_id", userId).order("created_at", { ascending: true }),
      supabase.from("ai_interviews").select("*").eq("candidate_id", userId).maybeSingle(),
      supabase.from("stage_attempts").select("*").eq("candidate_id", userId).order("created_at", { ascending: true }),
    ]);

  // Fold stage_attempts into the { Professional, HR } shape the UI expects.
  const stageState = { Professional: emptyStage(), HR: emptyStage() };
  (stages || []).forEach((s) => {
    const cur = stageState[s.stage];
    cur.attempts = Math.max(cur.attempts, s.attempt_no);
    cur.passed = s.passed;
    cur.result = {
      verdict: s.verdict,
      avg: Number(s.avg),
      strengths: s.strengths || [],
      improvements: s.improvements || [],
      summary: s.summary,
      passed: s.passed,
    };
    cur.completedAt = s.created_at;
  });

  return {
    candidate: candidate || null,
    tokens: candidate?.tokens ?? 0,
    cv: cv
      ? { name: cv.file_name, uploadedAt: cv.uploaded_at, industry: cv.industry, jobType: cv.job_type, status: cv.status, path: cv.file_path, reviewNote: cv.review_note }
      : null,
    interviews: (interviews || []).map(mapInterview),
    aiInterview: ai
      ? { attempts: ai.attempts, lastScore: ai.last_score, passed: ai.passed, breakdown: ai.breakdown, feedback: ai.feedback, band: ai.band || null, suggestedTraining: ai.suggested_training || null, status: ai.status || "released" }
      : { attempts: 0, lastScore: null, passed: false, breakdown: null, feedback: "", band: null, suggestedTraining: null, status: "released" },
    stages: stageState,
  };
}

const emptyStage = () => ({ attempts: 0, passed: false, result: null, completedAt: null });

const mapInterview = (i) => ({
  id: i.id,
  type: i.type,
  mode: i.mode,
  role: i.role,
  date: i.scheduled_date,
  time: i.scheduled_time,
  interviewer: i.interviewer_name || "",
  assigned: !!i.interviewer_id,
  status: i.status,
  meetLink: i.meet_link || null,
  bookingGroup: i.booking_group || null,
});

// Map an interview row returned by the schedule API into the UI shape.
export function mapScheduledRow(i) {
  return mapInterview(i);
}

// ---- Profile --------------------------------------------------------
export async function updateProfile(supabase, userId, fields) {
  return supabase.from("profiles").update(fields).eq("id", userId);
}

export async function updateCandidate(supabase, userId, fields) {
  return supabase.from("candidates").update(fields).eq("id", userId);
}

// Full candidate profile for the Profile page (profiles + candidates).
export async function loadProfileDetails(supabase, userId) {
  const [{ data: p }, { data: c }] = await Promise.all([
    supabase.from("profiles").select("full_name, email, phone, country, bio, avatar_url").eq("id", userId).maybeSingle(),
    supabase.from("candidates").select("target_role, experience, skills, kyc").eq("id", userId).maybeSingle(),
  ]);
  return { profile: p || {}, candidate: c || {} };
}

export async function uploadAvatar(supabase, userId, file) {
  const safe = (file.name || "avatar.png").replace(/[^A-Za-z0-9._-]+/g, "_");
  const path = `${userId}/${Date.now()}_${safe}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type || "image/png" });
  if (error) throw error;
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data?.publicUrl || null;
}

// ---- CV (metadata row; file goes to Storage separately) -------------
export async function saveCvRow(supabase, userId, { fileName, filePath, industry, jobType }) {
  return supabase.from("cvs").insert({
    candidate_id: userId,
    file_name: fileName,
    file_path: filePath || null,
    industry: industry || null,
    job_type: jobType || "Full-time",
  });
}

// Upload a CV file to the private "cvs" bucket under "<uid>/<filename>".
export async function uploadCvFile(supabase, userId, file) {
  // Sanitize the name (spaces / odd chars break some storage keys).
  const safe = (file.name || "cv.pdf").replace(/[^A-Za-z0-9._-]+/g, "_");
  const path = `${userId}/${Date.now()}_${safe}`;
  const { error } = await supabase.storage
    .from("cvs")
    .upload(path, file, { upsert: true, contentType: file.type || "application/pdf" });
  if (error) throw error;
  return path;
}

// ---- Interviews -----------------------------------------------------
export async function scheduleInterviewRow(supabase, userId, data) {
  return supabase
    .from("interviews")
    .insert({
      candidate_id: userId,
      type: data.type,
      mode: data.mode,
      role: data.role,
      scheduled_date: data.date,
      scheduled_time: data.time,
    })
    .select()
    .single();
}

export async function cancelInterviewRow(supabase, id) {
  return supabase.from("interviews").delete().eq("id", id);
}

// ---- Platform settings (pass marks + pricing) -----------------------
export const DEFAULT_SETTINGS = {
  pass_mark_ai: 85,               // "ready" band threshold
  ai_foundational_mark: 60,       // below this → foundational band
  pass_mark_professional: 70,
  pass_mark_hr: 70,
  currency: "NGN",
  subscription_annual_amount: 29999,
  training_default_amount: 450000,      // intensive, per role
  training_foundational_amount: 150000, // foundational, per role
  placement_fee_amount: 0,
  free_ai_retakes: 1,
  ai_result_requires_approval: false,
  oauth_google_enabled: false,
  oauth_apple_enabled: false,
  landing_spotlight_count: 6,
};

// Fallback hero spotlights used in demo mode (no Supabase) or before any are
// created. Kept in sync with the seed in 0020_landing.sql.
export const DEFAULT_SPOTLIGHTS = [
  { id: "d1", quote: "NexIT is a life-changing discovery — the AI interview showed me exactly what to fix, and the training got me job-ready.", name: "Amara O.", role: "Full-Stack Developer", image_url: "/images/team-2.jpg", sort: 0, enabled: true },
  { id: "d2", quote: "I went from endless rejections to two offers in six weeks. The role-specific training made all the difference.", name: "Tunde A.", role: "Data Analyst", image_url: "/images/team-3.jpg", sort: 1, enabled: true },
  { id: "d3", quote: "As an employer, the candidate board saves us weeks — everyone is already vetted across AI, professional and HR rounds.", name: "Chioma E.", role: "Hiring Manager", image_url: "/images/team-1.jpg", sort: 2, enabled: true },
  { id: "d4", quote: "The diagnostic was brutally honest in the best way. I finally knew what to learn next.", name: "Kwame B.", role: "Cloud Engineer", image_url: "/images/team-4.jpg", sort: 3, enabled: true },
];

// Classify an AI score into a diagnostic band using the configured thresholds.
export function bandFor(score, settings) {
  const ready = Number(settings?.pass_mark_ai ?? 85);
  const found = Number(settings?.ai_foundational_mark ?? 60);
  if (score == null) return "foundational";
  if (score >= ready) return "ready";
  if (score >= found) return "close";
  return "foundational";
}

// ---- NexIT-curated specific courses ---------------------------------
export async function loadSpecificCourses(supabase, roleKey) {
  let q = supabase.from("specific_courses").select("*").order("sort", { ascending: true });
  if (roleKey) q = q.eq("role_key", roleKey);
  const { data } = await q;
  return data || [];
}

export async function createSpecificCourse(supabase, row) {
  return supabase.from("specific_courses").insert(row).select().single();
}

// ---- LMS: course modules (admin-managed, client via RLS) ------------
export async function loadCourseModules(supabase, courseId) {
  const { data } = await supabase.from("course_modules").select("*").eq("course_id", courseId).order("sort", { ascending: true });
  return data || [];
}
export async function createModule(supabase, row) {
  return supabase.from("course_modules").insert(row).select().single();
}
export async function updateModule(supabase, id, fields) {
  return supabase.from("course_modules").update(fields).eq("id", id);
}
export async function deleteModule(supabase, id) {
  return supabase.from("course_modules").delete().eq("id", id);
}
// Upload a file to the private 'training' bucket (material or submission).
export async function uploadTrainingFile(supabase, userId, file) {
  const safe = (file.name || "file.pdf").replace(/[^A-Za-z0-9._-]+/g, "_");
  const path = `${userId}/${Date.now()}_${safe}`;
  const { error } = await supabase.storage.from("training").upload(path, file, { upsert: true, contentType: file.type || "application/octet-stream" });
  if (error) throw error;
  return { path, name: file.name };
}
export async function updateSpecificCourse(supabase, id, fields) {
  return supabase.from("specific_courses").update(fields).eq("id", id);
}
export async function deleteSpecificCourse(supabase, id) {
  return supabase.from("specific_courses").delete().eq("id", id);
}

// ---- Suggested resources (admin-curated) ----------------------------
export async function loadSuggestedResources(supabase, roleKey) {
  let q = supabase.from("suggested_resources").select("*").order("sort", { ascending: true });
  const { data } = await q;
  const rows = data || [];
  // Client-side filter: role-specific (matching role) + general (null role).
  return roleKey ? rows.filter((r) => !r.role_key || r.role_key === roleKey) : rows;
}
export async function createSuggestedResource(supabase, row) {
  return supabase.from("suggested_resources").insert(row).select().single();
}
export async function updateSuggestedResource(supabase, id, fields) {
  return supabase.from("suggested_resources").update(fields).eq("id", id);
}
export async function deleteSuggestedResource(supabase, id) {
  return supabase.from("suggested_resources").delete().eq("id", id);
}

// ---- Testimonials / outcomes ----------------------------------------
export async function loadTestimonials(supabase, onlyPublished = true) {
  let q = supabase.from("testimonials").select("*").order("sort", { ascending: true });
  if (onlyPublished) q = q.eq("published", true);
  const { data } = await q;
  return data || [];
}
export async function createTestimonial(supabase, row) {
  return supabase.from("testimonials").insert(row).select().single();
}
export async function updateTestimonial(supabase, id, fields) {
  return supabase.from("testimonials").update(fields).eq("id", id);
}
export async function deleteTestimonial(supabase, id) {
  return supabase.from("testimonials").delete().eq("id", id);
}

// ---- Employer hire requests -----------------------------------------
export async function createHireRequest(supabase, recruiterId, candidateId, { position, message }) {
  return supabase.from("hire_requests").insert({ recruiter_id: recruiterId, candidate_id: candidateId, position: position || null, message: message || null }).select().single();
}
export async function loadHireRequests(supabase) {
  // Admin/staff see all; recruiter sees own; candidate sees own (RLS enforces).
  const { data } = await supabase
    .from("hire_requests")
    .select("*, candidate:candidate_id(profiles(full_name, email)), recruiter:recruiter_id(full_name, email)")
    .order("created_at", { ascending: false });
  return data || [];
}
export async function updateHireRequest(supabase, id, status) {
  return supabase.from("hire_requests").update({ status }).eq("id", id);
}

export async function loadSettings(supabase) {
  try {
    const { data } = await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle();
    return { ...DEFAULT_SETTINGS, ...(data || {}) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(supabase, fields) {
  return supabase
    .from("app_settings")
    .upsert({ id: 1, ...fields, updated_at: new Date().toISOString() }, { onConflict: "id" });
}

// Candidate subscription state + specific-training access + last AI attempt.
export async function loadCandidateAccess(supabase, userId) {
  const [{ data: cand }, { data: access }] = await Promise.all([
    supabase.from("candidates").select("subscription_until, last_ai_attempt_at").eq("id", userId).maybeSingle(),
    supabase.from("training_access").select("role_key").eq("candidate_id", userId),
  ]);
  const now = Date.now();
  const subUntil = cand?.subscription_until ? new Date(cand.subscription_until).getTime() : 0;
  return {
    subscribed: subUntil > now,
    subscriptionUntil: cand?.subscription_until || null,
    lastAiAttemptAt: cand?.last_ai_attempt_at || null,
    trainingRoles: (access || []).map((a) => a.role_key),
  };
}

// Real interviewer names by stage kind, for the scheduling summary.
// Returns e.g. { Professional: "Ada N.", HR: "John A." } — only kinds that exist.
export async function loadInterviewerNames(supabase) {
  const { data } = await supabase.from("interviewers").select("kind, profiles(full_name)");
  const by = {};
  (data || []).forEach((r) => {
    const name = r?.profiles?.full_name;
    if (r?.kind && name && !by[r.kind]) by[r.kind] = name;
  });
  return by;
}

// ---- AI interview ---------------------------------------------------
export async function recordAiAttemptRow(supabase, userId, { score, breakdown, feedback, passed, band, suggestedTraining, status }) {
  // read current attempts, then upsert
  const { data: cur } = await supabase.from("ai_interviews").select("attempts").eq("candidate_id", userId).maybeSingle();
  const attempts = (cur?.attempts ?? 0) + 1;
  const now = new Date().toISOString();
  const row = {
    candidate_id: userId,
    attempts,
    last_score: score,
    passed,
    breakdown,
    feedback,
    updated_at: now,
  };
  // 0010 columns (guarded so older schemas still work).
  if (band !== undefined) row.band = band;
  if (suggestedTraining !== undefined) row.suggested_training = suggestedTraining;
  if (status !== undefined) row.status = status;
  let res = await supabase.from("ai_interviews").upsert(row);
  if (res.error && /column .* does not exist/i.test(res.error.message || "")) {
    // Pre-0010 schema: retry without the new columns.
    res = await supabase.from("ai_interviews").upsert({ candidate_id: userId, attempts, last_score: score, passed, breakdown, feedback, updated_at: now });
  }
  // Stamp the attempt time on the candidate for the retake cooldown.
  try { await supabase.from("candidates").update({ last_ai_attempt_at: now }).eq("id", userId); } catch { /* column may not exist pre-0009 */ }
  return res;
}

// ---- Human stages (Professional / HR) -------------------------------
export async function completeStageRow(supabase, userId, stage, { passed, result }) {
  const { data: prev } = await supabase
    .from("stage_attempts")
    .select("attempt_no")
    .eq("candidate_id", userId)
    .eq("stage", stage)
    .order("attempt_no", { ascending: false })
    .limit(1)
    .maybeSingle();
  const attempt_no = (prev?.attempt_no ?? 0) + 1;

  const ins = await supabase.from("stage_attempts").insert({
    candidate_id: userId,
    stage,
    attempt_no,
    passed,
    verdict: result.verdict,
    avg: result.avg,
    strengths: result.strengths,
    improvements: result.improvements,
    summary: result.summary,
  });

  // Passing HR puts the candidate on the board.
  if (passed && stage === "HR") {
    await supabase.from("candidates").update({ on_board: true }).eq("id", userId);
  }
  return ins;
}

// Spend a token to retry a stage: decrement + ledger entry. Returns ok:boolean.
export async function retryStageTxn(supabase, userId, stage) {
  const { data: c } = await supabase.from("candidates").select("tokens").eq("id", userId).single();
  if (!c || c.tokens <= 0) return { ok: false };
  const [{ error: e1 }, { error: e2 }, { error: e3 }] = await Promise.all([
    supabase.from("candidates").update({ tokens: c.tokens - 1 }).eq("id", userId),
    supabase.from("token_transactions").insert({ candidate_id: userId, type: "spend", amount: -1, reason: `${stage} retry` }),
    supabase.from("interviews").delete().eq("candidate_id", userId).eq("type", stage),
  ]);
  return { ok: !e1 && !e2 && !e3 };
}

// ---- Interviewer notes ---------------------------------------------
export async function upsertInterviewerNote(supabase, interviewerId, candidateId, stage, note) {
  return supabase.from("interviewer_notes").upsert(
    {
      interviewer_id: interviewerId,
      candidate_id: candidateId,
      stage,
      rating: note.rating,
      strengths: note.strengths,
      improvements: note.improvements,
      note: note.note,
    },
    { onConflict: "interviewer_id,candidate_id,stage" }
  );
}

// ---- Boards / dashboards -------------------------------------------
export async function loadBoardCandidates(supabase) {
  const { data } = await supabase
    .from("candidates")
    .select("id, target_role, experience, skills, on_board, avg_score, top_skill, profiles(full_name, country, avatar_url)")
    .eq("on_board", true);
  return data || [];
}

export async function loadJobs(supabase) {
  const { data } = await supabase.from("jobs").select("*").order("posted_at", { ascending: false });
  return data || [];
}

// ---- Job board ------------------------------------------------------
export async function loadApprovedJobs(supabase) {
  const { data } = await supabase.from("jobs").select("*").eq("status", "approved").order("posted_at", { ascending: false });
  return data || [];
}
export async function loadMyJobs(supabase, uid) {
  const { data } = await supabase.from("jobs").select("*").eq("posted_by", uid).order("posted_at", { ascending: false });
  return data || [];
}
export async function createJob(supabase, row) {
  return supabase.from("jobs").insert(row).select().single();
}
export async function updateJob(supabase, id, fields) {
  return supabase.from("jobs").update(fields).eq("id", id);
}
export async function deleteJob(supabase, id) {
  return supabase.from("jobs").delete().eq("id", id);
}
export async function loadMyApplications(supabase, uid) {
  const { data } = await supabase.from("applications").select("job_id, status, created_at").eq("candidate_id", uid);
  return data || [];
}

// ---- Staff onboarding (interviewer / recruiter) ---------------------
export async function uploadStaffDocFile(supabase, userId, file) {
  const safe = (file.name || "document.pdf").replace(/[^A-Za-z0-9._-]+/g, "_");
  const path = `${userId}/${Date.now()}_${safe}`;
  const { error } = await supabase.storage
    .from("staff-docs")
    .upload(path, file, { upsert: true, contentType: file.type || "application/octet-stream" });
  if (error) throw error;
  return path;
}
export async function attachStaffDoc(supabase, userId, { docPath, docName }) {
  const { error } = await supabase.from("staff_applications").update({ doc_path: docPath, doc_name: docName }).eq("user_id", userId);
  if (error) throw error;
  return true;
}
export async function loadStaffApplication(supabase, userId) {
  const { data } = await supabase.from("staff_applications").select("*").eq("user_id", userId).maybeSingle();
  return data || null;
}
// Signed URL to view a staff document (staff/admin).
export async function staffDocSignedUrl(supabase, path) {
  if (!path) return null;
  const { data } = await supabase.storage.from("staff-docs").createSignedUrl(path, 3600);
  return data?.signedUrl || null;
}

// Notification toggle preferences (jsonb map keyed "gi.ii").
export async function loadNotificationPrefs(supabase, userId) {
  const { data } = await supabase.from("notification_prefs").select("prefs").eq("user_id", userId).maybeSingle();
  return data?.prefs || {};
}
export async function saveNotificationPrefs(supabase, userId, prefs) {
  return supabase.from("notification_prefs").upsert({ user_id: userId, prefs }, { onConflict: "user_id" });
}

export async function loadNotifications(supabase, userId) {
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data || [];
}

// Interviewer candidate view: the candidate + ALL panel notes for a stage,
// plus this interviewer's own note (to prefill the form).
export async function loadInterviewerCandidate(supabase, candidateId, stage, myId) {
  const [{ data: prof }, { data: cand }, { data: notes }, { data: attempt }, { data: booking }] = await Promise.all([
    supabase.from("profiles").select("full_name, email").eq("id", candidateId).maybeSingle(),
    supabase.from("candidates").select("target_role").eq("id", candidateId).maybeSingle(),
    supabase
      .from("interviewer_notes")
      .select("interviewer_id, rating, strengths, improvements, note, stage, created_at, profiles(full_name, role)")
      .eq("candidate_id", candidateId)
      .eq("stage", stage)
      .order("created_at", { ascending: true }),
    supabase
      .from("stage_attempts")
      .select("passed, verdict, avg, attempt_no, created_at")
      .eq("candidate_id", candidateId).eq("stage", stage)
      .order("attempt_no", { ascending: false }).limit(1).maybeSingle(),
    supabase
      .from("interviews")
      .select("id, scheduled_date, scheduled_time, meet_link, status")
      .eq("candidate_id", candidateId).eq("type", stage).eq("status", "Confirmed")
      .limit(1).maybeSingle(),
  ]);

  const mapped = (notes || []).map((n) => ({
    interviewerId: n.interviewer_id,
    interviewer: n.profiles?.full_name || "Interviewer",
    kind: stage,
    rating: n.rating,
    strengths: n.strengths,
    improvements: n.improvements,
    note: n.note,
  }));

  return {
    name: prof?.full_name || "Candidate",
    email: prof?.email || "",
    role: ROLE_LABELS[cand?.target_role] || cand?.target_role || "—",
    notes: mapped,
    myNote: mapped.find((n) => n.interviewerId === myId) || null,
    // Latest recorded outcome for this stage (null until a verdict is submitted).
    outcome: attempt ? { passed: attempt.passed, verdict: attempt.verdict, avg: Number(attempt.avg), attemptNo: attempt.attempt_no } : null,
    // A confirmed booking awaiting a verdict (the candidate has scheduled it).
    booking: booking ? { id: booking.id, date: booking.scheduled_date, time: booking.scheduled_time, meetLink: booking.meet_link } : null,
  };
}

// Submitted CVs for the admin review queue.
export async function loadCvSubmissions(supabase) {
  const { data } = await supabase
    .from("cvs")
    .select("id, file_name, file_path, industry, job_type, status, review_note, uploaded_at, candidate_id, candidates(target_role, experience, skills, profiles(full_name, email))")
    .order("uploaded_at", { ascending: false });
  return (data || []).map((c) => ({
    id: c.id,
    candidateId: c.candidate_id,
    name: c.candidates?.profiles?.full_name || "Candidate",
    email: c.candidates?.profiles?.email || "",
    roleKey: c.candidates?.target_role || null,
    targetRole: ROLE_LABELS[c.candidates?.target_role] || c.candidates?.target_role || "—",
    skills: c.candidates?.skills || [],
    experience: c.candidates?.experience || "",
    fileName: c.file_name,
    filePath: c.file_path,
    industry: c.industry,
    jobType: c.job_type,
    status: c.status,
    reviewNote: c.review_note,
    uploadedAt: c.uploaded_at,
  }));
}

// Role requirement profiles (skillsets) keyed by role.
export async function loadRoleRequirements(supabase) {
  const { data } = await supabase.from("role_requirements").select("*").order("title", { ascending: true });
  const byKey = {};
  (data || []).forEach((r) => (byKey[r.role_key] = r));
  return { list: data || [], byKey };
}

export async function saveRoleRequirement(supabase, roleKey, fields) {
  return supabase.from("role_requirements").update({ ...fields, updated_at: new Date().toISOString() }).eq("role_key", roleKey);
}

export async function createRoleRequirement(supabase, row) {
  return supabase.from("role_requirements").insert({ ...row, updated_at: new Date().toISOString() }).select().single();
}

export async function deleteRoleRequirement(supabase, roleKey) {
  return supabase.from("role_requirements").delete().eq("role_key", roleKey);
}

// Signed URL to view/download a private CV file (60 min).
export async function cvSignedUrl(supabase, path) {
  if (!path) return null;
  const { data } = await supabase.storage.from("cvs").createSignedUrl(path, 3600);
  return data?.signedUrl || null;
}

// Platform-wide counts for the admin dashboard.
export async function loadAdminStats(supabase) {
  const countOf = async (table, col, val) => {
    let q = supabase.from(table).select("*", { count: "exact", head: true });
    if (col) q = q.eq(col, val);
    const { count } = await q;
    return count || 0;
  };
  const [candidates, interviewers, recruiters, cvs, boarded] = await Promise.all([
    countOf("profiles", "role", "candidate"),
    countOf("profiles", "role", "interviewer"),
    countOf("profiles", "role", "recruiter"),
    countOf("cvs"),
    countOf("candidates", "on_board", true),
  ]);
  return { candidates, interviewers, recruiters, cvs, boarded };
}

// Human-readable label for a target-role code.
export const ROLE_LABELS = {
  software: "Software Development",
  data: "Data & Analytics",
  product: "Product & Design",
  cloud: "Cloud & DevOps",
  security: "Cybersecurity",
  support: "IT Support",
};

// Admin charts: applications trend (new candidates per month) + pipeline funnel.
export async function loadAdminCharts(supabase) {
  const [{ data: created }, aiPass, proPass, hrPass, boarded, hired] = await Promise.all([
    supabase.from("candidates").select("created_at"),
    supabase.from("ai_interviews").select("*", { count: "exact", head: true }).eq("passed", true),
    supabase.from("stage_attempts").select("*", { count: "exact", head: true }).eq("stage", "Professional").eq("passed", true),
    supabase.from("stage_attempts").select("*", { count: "exact", head: true }).eq("stage", "HR").eq("passed", true),
    supabase.from("candidates").select("*", { count: "exact", head: true }).eq("on_board", true),
    supabase.from("applications").select("*", { count: "exact", head: true }),
  ]);

  // Bucket signups into the last 8 months.
  const N = 8;
  const now = new Date();
  const labels = [];
  const counts = new Array(N).fill(0);
  const idx = {};
  for (let i = N - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    idx[key] = N - 1 - i;
    labels.push(d.toLocaleString("en", { month: "short" }));
  }
  (created || []).forEach((r) => {
    const d = new Date(r.created_at);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (key in idx) counts[idx[key]] += 1;
  });

  return {
    trend: counts,
    trendLabels: labels,
    pipeline: [
      { label: "AI", value: aiPass.count || 0 },
      { label: "Prof.", value: proPass.count || 0 },
      { label: "HR", value: hrPass.count || 0 },
      { label: "Board", value: boarded.count || 0 },
      { label: "Hired", value: hired.count || 0 },
    ],
  };
}

// Interviewer dashboard: stats, assigned interviews, notes-based feedback, pay.
export async function loadInterviewerDashboard(supabase, uid) {
  const [{ data: interviews }, { data: notes }, { data: payments }] = await Promise.all([
    supabase
      .from("interviews")
      .select("id, type, role, scheduled_date, scheduled_time, meet_link, status, candidate_id, candidates(profiles(full_name))")
      .eq("interviewer_id", uid)
      .order("scheduled_date", { ascending: true }),
    supabase
      .from("interviewer_notes")
      .select("rating, candidate_id, candidates(profiles(full_name)), stage")
      .eq("interviewer_id", uid),
    supabase.from("payments").select("*").eq("interviewer_id", uid).order("created_at", { ascending: false }),
  ]);

  const iv = interviews || [];
  const nt = notes || [];
  const pay = payments || [];

  const conducted = iv.filter((i) => i.status === "Completed").length;
  const scheduled = iv.filter((i) => i.status === "Confirmed").length;
  const earned = pay.filter((p) => p.status === "Paid").reduce((s, p) => s + Number(p.amount || 0), 0);
  const ratings = nt.map((n) => Number(n.rating)).filter((r) => r > 0);
  const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—";

  // Outcome distribution from this interviewer's ratings.
  const rec = ratings.filter((r) => r >= 4).length;
  const bord = ratings.filter((r) => r === 3).length;
  const not = ratings.filter((r) => r < 3).length;
  const tot = rec + bord + not || 1;
  const outcomes = [
    { label: "Recommended", pct: Math.round((rec / tot) * 100), color: "#2ecc71" },
    { label: "Borderline", pct: Math.round((bord / tot) * 100), color: "#007bff" },
    { label: "Not recommended", pct: Math.round((not / tot) * 100), color: "#1c1f2a" },
  ];

  const notedIds = new Set(nt.map((n) => n.candidate_id));
  const COLORS = ["#7c9cff", "#ffb27c", "#8ad4a0", "#c7a3ff", "#7cd4ce", "#ff9db1"];

  return {
    stats: [
      { label: "Interviews Conducted", value: String(conducted) },
      { label: "Interviews Scheduled", value: String(scheduled).padStart(2, "0") },
      { label: "Total Payment Earned", value: `$${earned}` },
      { label: "Upcoming Interviews", value: String(scheduled) },
      { label: "Average Feedback Score", value: String(avg) },
    ],
    outcomes,
    scheduled: iv.map((i) => ({
      id: i.id,
      candidateId: i.candidate_id,
      name: i.candidates?.profiles?.full_name || "Candidate",
      role: i.role || i.type,
      date: i.scheduled_date || "—",
      time: i.scheduled_time || "",
      meetLink: i.meet_link || null,
      type: i.type,
      status: i.status === "Completed" ? "Reviewed" : "Upcoming",
    })),
    feedback: iv.map((i, k) => ({
      id: i.candidate_id,
      name: i.candidates?.profiles?.full_name || "Candidate",
      role: i.role || i.type,
      color: COLORS[k % COLORS.length],
      reviewed: notedIds.has(i.candidate_id),
    })),
    payments: pay.map((p) => ({
      candidate: p.candidate_name || "—",
      date: new Date(p.created_at).toLocaleDateString("en-GB"),
      position: p.position || "—",
      status: p.status,
      amount: `$${Number(p.amount || 0)}`,
    })),
  };
}

// Map a DB candidate (with joined profile) to the recruiter BoardCard shape.
const BOARD_COLORS = ["#7c9cff", "#ffb27c", "#8ad4a0", "#c7a3ff", "#7cd4ce", "#ff9db1"];
export function mapBoardCandidate(row, i = 0) {
  const yrs = parseInt(String(row.experience || "").replace(/\D/g, ""), 10) || 0;
  const level = yrs >= 6 ? "Senior" : yrs >= 3 ? "Mid" : yrs >= 1 ? "Junior" : "Entry";
  return {
    id: row.id,
    name: row.profiles?.full_name || "Candidate",
    role: ROLE_LABELS[row.target_role] || row.target_role || "—",
    exp: row.experience || `${yrs}yrs`,
    level,
    location: row.profiles?.country || "Remote",
    skills: row.skills || [],
    rating: Math.round(Number(row.avg_score) || 5),
    status: "Interviewed",
    color: BOARD_COLORS[i % BOARD_COLORS.length],
  };
}
