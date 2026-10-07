"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { SUPABASE_ENABLED } from "@/lib/supabase/config";
import { getBrowserSupabase } from "@/lib/supabase/client";
import * as db from "@/lib/db";
import { computeStageResult } from "@/components/interview/stage";

/**
 * Auth/session store for the candidate flow.
 *
 * Two modes, chosen automatically:
 *  - DEMO (no Supabase keys): front-end only, mirrored to localStorage.
 *  - REAL (Supabase keys present): real email/password auth + Postgres data
 *    through the RLS-protected tables. The public API below is identical in
 *    both modes, so pages don't care which is active.
 */

const AuthContext = createContext(null);
const STORAGE_KEY = "nexit.auth.v1";

const emptySignup = {
  role: "candidate", orgName: "",
  firstName: "", lastName: "", email: "", country: "Nigeria", phone: "",
  timezone: "GMT+1", password: "", agreeTerms: false,
  jobTitle: "", experience: "", skills: "",
  targetRole: "", jobType: "Full-time", cvName: "",
  roleNotListed: false, interestedRole: "", targetRoleLabel: "",
};

const emptyApp = {
  cv: null,
  interviews: [],
  aiInterview: { attempts: 0, lastScore: null, passed: false, breakdown: null, feedback: "", band: null, suggestedTraining: null, status: "released" },
  trainingUnlocked: false,
  savedTraining: [],
  interviewerNotes: {},
  aiFinal: {},
  tokens: 3,
  stages: {
    Professional: { attempts: 0, passed: false, result: null, completedAt: null },
    HR: { attempts: 0, passed: false, result: null, completedAt: null },
  },
};

export const AI_PASS_MARK = 85;
export const MAX_STAGE_RETRIES = 2;

// Seeded demo accounts used by the login page's quick-portal links in REAL
// mode (created by supabase/seed.sql). Password is shared for the demo only.
export const DEMO_ACCOUNTS = {
  candidate: { email: "candidate@nexit.africa", password: "Password123!" },
  interviewer: { email: "interviewer@nexit.africa", password: "Password123!" },
  hr: { email: "hr@nexit.africa", password: "Password123!" },
  recruiter: { email: "recruiter@nexit.africa", password: "Password123!" },
  admin: { email: "admin@nexit.africa", password: "Password123!" },
};

export function AuthProvider({ children }) {
  const [signup, setSignup] = useState(emptySignup);
  const [user, setUser] = useState(null); // { email, name }
  const [role, setRole] = useState("candidate");
  const [app, setApp] = useState(emptyApp);
  const [hydrated, setHydrated] = useState(false);
  const [viewAs, setViewAs] = useState("candidate");
  const [interviewerKind, setInterviewerKind] = useState("Professional");
  const [approvalStatus, setApprovalStatus] = useState("approved");

  const supabase = SUPABASE_ENABLED ? getBrowserSupabase() : null;

  // Load the signed-in user's profile + (if candidate) app data from Postgres.
  const bootstrapFromSupabase = useCallback(async () => {
    if (!supabase) return;
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    if (!authUser) {
      setUser(null);
      setHydrated(true);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
    const r = profile?.role || "candidate";
    setUser({ email: profile?.email || authUser.email, name: profile?.full_name || "User" });
    setRole(r);
    setViewAs(r);
    setApprovalStatus(profile?.approval_status || "approved");
    if (r === "interviewer") {
      const { data: iv } = await supabase.from("interviewers").select("kind").eq("id", authUser.id).maybeSingle();
      if (iv?.kind) setInterviewerKind(iv.kind);
    }
    if (r === "candidate") {
      try {
        const state = await db.loadCandidateState(supabase, authUser.id);
        setApp((prev) => ({ ...prev, ...state }));
      } catch {
        /* candidate row may not exist yet */
      }
    }
    setHydrated(true);
  }, [supabase]);

  // Initial load.
  useEffect(() => {
    if (SUPABASE_ENABLED && supabase) {
      bootstrapFromSupabase();
      const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
        if (!session) {
          setUser(null);
          setApp(emptyApp);
        } else {
          bootstrapFromSupabase();
        }
      });
      return () => sub?.subscription?.unsubscribe();
    }
    // DEMO mode: restore from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.signup) setSignup({ ...emptySignup, ...parsed.signup });
        if (parsed.user) setUser(parsed.user);
        if (parsed.app)
          setApp({
            ...emptyApp,
            ...parsed.app,
            aiInterview: { ...emptyApp.aiInterview, ...(parsed.app.aiInterview || {}) },
            interviewerNotes: { ...(parsed.app.interviewerNotes || {}) },
            aiFinal: { ...(parsed.app.aiFinal || {}) },
            tokens: parsed.app.tokens ?? emptyApp.tokens,
            stages: {
              Professional: { ...emptyApp.stages.Professional, ...(parsed.app.stages?.Professional || {}) },
              HR: { ...emptyApp.stages.HR, ...(parsed.app.stages?.HR || {}) },
            },
          });
        if (parsed.viewAs) setViewAs(parsed.viewAs);
        if (parsed.interviewerKind) setInterviewerKind(parsed.interviewerKind);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist (demo mode only).
  useEffect(() => {
    if (!hydrated || SUPABASE_ENABLED) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ signup, user, app, viewAs, interviewerKind }));
    } catch {
      /* ignore */
    }
  }, [signup, user, app, viewAs, interviewerKind, hydrated]);

  const updateSignup = (fields) => setSignup((prev) => ({ ...prev, ...fields }));

  // ---- Auth ----
  // REAL: email + password. DEMO: accept anything. Returns { error } | {}.
  const login = async (email, password) => {
    if (SUPABASE_ENABLED && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      let r = "candidate";
      if (data?.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        r = profile?.role || "candidate";
      }
      await bootstrapFromSupabase();
      return { role: r };
    }
    // demo: 2nd arg was a display name in the old API
    setUser({ email, name: typeof password === "string" && password.includes(" ") ? password : email.split("@")[0] });
    return { role: "candidate" };
  };

  // REAL signup: create the auth user with role metadata (trigger builds rows).
  // Returns { needsConfirm } — true when Supabase requires email confirmation
  // (no session yet), false when confirmation is off (already signed in).
  const signUpUser = async () => {
    if (SUPABASE_ENABLED && supabase) {
      const fullName = [signup.firstName, signup.lastName].filter(Boolean).join(" ") || "Candidate";
      const emailRedirectTo =
        typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
      // Map the chosen signup role → DB role + interviewer kind.
      const chosen = signup.role || "candidate";
      const dbRole = chosen === "recruiter" ? "recruiter" : chosen === "professional" || chosen === "hr" ? "interviewer" : "candidate";
      const kind = chosen === "hr" ? "HR" : "Professional";
      const { data, error } = await supabase.auth.signUp({
        email: signup.email,
        password: signup.password,
        options: {
          emailRedirectTo,
          data: {
            role: dbRole, // trigger clamps anything unexpected to candidate
            interviewer_kind: kind,
            org_name: signup.orgName || "",
            full_name: fullName,
            phone: signup.phone,
            country: signup.country,
            target_role: signup.roleNotListed ? "" : signup.targetRole,
            interested_role: signup.roleNotListed ? (signup.interestedRole || "").trim() : "",
            experience: signup.experience,
            skills: signup.skills,
            job_type: signup.jobType,
          },
        },
      });
      if (error) return { error: error.message };
      // If a session came back, email confirmation is OFF → already signed in.
      if (data?.session) {
        await bootstrapFromSupabase();
        return { needsConfirm: false };
      }
      return { needsConfirm: true };
    }
    completeSignup();
    return { needsConfirm: false };
  };

  // Verify the 6-digit signup code (email OTP).
  const verifyEmailOtp = async (email, token) => {
    if (!(SUPABASE_ENABLED && supabase)) return {};
    const { error } = await supabase.auth.verifyOtp({ email, token, type: "signup" });
    if (error) return { error: error.message };
    await bootstrapFromSupabase();
    return {};
  };

  // Resend the signup confirmation email.
  const resendConfirmation = async (email) => {
    if (!(SUPABASE_ENABLED && supabase)) return {};
    const emailRedirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;
    const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo } });
    return error ? { error: error.message } : {};
  };

  const completeSignup = () => {
    const name = [signup.firstName, signup.lastName].filter(Boolean).join(" ");
    setUser({ email: signup.email, name: name || "Candidate" });
    if (signup.cvName) {
      setApp((prev) => ({
        ...prev,
        cv: prev.cv || { name: signup.cvName, uploadedAt: new Date().toISOString(), industry: "", jobType: signup.jobType || "Full-time", status: "Pending review" },
      }));
    }
    return {};
  };

  // Sign into a seeded demo account (REAL mode quick-portal links).
  const loginDemo = async (key) => {
    const acct = DEMO_ACCOUNTS[key];
    if (!acct) return { error: "unknown demo account" };
    return login(acct.email, acct.password);
  };

  const logout = async () => {
    if (SUPABASE_ENABLED && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSignup(emptySignup);
    setApp(emptyApp);
    setViewAs("candidate");
    setRole("candidate");
    setApprovalStatus("approved");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  // Helper to get the current auth user id in REAL mode.
  const getUid = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  }, [supabase]);

  // ---- CV ----
  // Returns { error, warning } so the CV page can report upload problems
  // (e.g. the Storage bucket/policy migration wasn't run) instead of silently
  // saving a fileless record.
  const uploadCv = async (cv) => {
    let warning = null;
    if (SUPABASE_ENABLED && supabase) {
      const id = await getUid();
      if (!id) return { error: "You need to be signed in to upload a CV." };
      let path = null;
      if (cv.file) {
        try {
          path = await db.uploadCvFile(supabase, id, cv.file);
        } catch (e) {
          // Surface the real reason (common: "Bucket not found" → run
          // supabase/migrations/0002_storage.sql).
          warning = `Your details were saved, but the file couldn't be stored: ${e.message || e}. ` +
            `Make sure the Storage buckets exist (run 0002_storage.sql) and try again.`;
        }
      }
      const { error } = await db.saveCvRow(supabase, id, {
        fileName: cv.name || "cv.pdf", filePath: path, industry: cv.industry, jobType: cv.jobType,
      });
      if (error) return { error: error.message };
    }
    setApp((prev) => ({
      ...prev,
      cv: { name: cv.name || "cv.pdf", uploadedAt: new Date().toISOString(), industry: cv.industry || "", jobType: cv.jobType || "Full-time", status: "Pending review" },
    }));
    return warning ? { warning } : {};
  };
  const clearCv = () => setApp((prev) => ({ ...prev, cv: null }));

  // ---- Interviews ----
  const scheduleInterview = async (data) => {
    let newId = `int_${Date.now()}`;
    if (SUPABASE_ENABLED && supabase) {
      const id = await getUid();
      if (id) {
        const { data: row } = await db.scheduleInterviewRow(supabase, id, data);
        if (row?.id) newId = row.id;
      }
    }
    setApp((prev) => ({
      ...prev,
      interviews: [...prev.interviews, { id: newId, status: "Confirmed", ...data }],
    }));
  };
  // Append already-created interviews (from the schedule API or demo booking)
  // to local state so the list reflects them immediately.
  const addLocalInterviews = (items) =>
    setApp((prev) => ({ ...prev, interviews: [...prev.interviews, ...items] }));

  const cancelInterview = async (id) => {
    if (SUPABASE_ENABLED && supabase) {
      try { await db.cancelInterviewRow(supabase, id); } catch { /* ignore */ }
    }
    setApp((prev) => ({ ...prev, interviews: prev.interviews.filter((i) => i.id !== id) }));
  };

  // ---- AI interview ----
  // In REAL mode the server (/api/interview/ai) persists the authoritative
  // result with the service role — the browser can no longer write
  // ai_interviews — so here we only mirror it into local UI state.
  const recordAiAttempt = async ({ score, breakdown, feedback, passed, band, suggestedTraining, status }) => {
    setApp((prev) => ({
      ...prev,
      aiInterview: { attempts: (prev.aiInterview?.attempts ?? 0) + 1, lastScore: score, passed, breakdown, feedback, band: band ?? null, suggestedTraining: suggestedTraining ?? null, status: status ?? "released" },
    }));
  };

  // Re-pull the candidate's server state (used while waiting for an
  // interviewer's verdict to land).
  const refreshApp = useCallback(async () => {
    if (SUPABASE_ENABLED && supabase) { try { await bootstrapFromSupabase(); } catch { /* ignore */ } }
  }, [supabase, bootstrapFromSupabase]);

  // ---- Human stages ----
  // REAL mode: Professional/HR results are decided by interviewers (see
  // /api/interviewer/verdict); the candidate side is passive, so this just
  // refreshes to pick up a submitted verdict. DEMO mode: computed locally so
  // the pipeline is still demoable end-to-end. Returns { result, passed }.
  const completeStage = async (kind) => {
    if (SUPABASE_ENABLED && supabase) {
      await refreshApp();
      const s = app.stages?.[kind];
      return s?.result ? { result: s.result, passed: s.passed } : { pending: true };
    }
    // demo
    const attemptNo = (app.stages?.[kind]?.attempts ?? 0) + 1;
    const result = computeStageResult(kind, attemptNo);
    setApp((prev) => {
      const s = prev.stages?.[kind] || { attempts: 0 };
      return { ...prev, stages: { ...prev.stages, [kind]: { attempts: (s.attempts ?? 0) + 1, passed: result.passed, result, completedAt: new Date().toISOString() } } };
    });
    return { result, passed: result.passed };
  };

  const retryStage = async (kind) => {
    if (SUPABASE_ENABLED && supabase) {
      try {
        const res = await fetch("/api/interview/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind }) });
        const data = await res.json();
        if (!res.ok) return false;
        setApp((prev) => ({
          ...prev,
          tokens: data.tokens ?? prev.tokens,
          stages: { ...prev.stages, [kind]: { ...prev.stages[kind], passed: false, result: null } },
          interviews: prev.interviews.filter((i) => i.type !== kind),
        }));
        return true;
      } catch { return false; }
    }
    let ok = false;
    setApp((prev) => {
      const s = prev.stages?.[kind] || { attempts: 0 };
      if ((prev.tokens ?? 0) <= 0) return prev;
      if ((s.attempts ?? 0) > MAX_STAGE_RETRIES) return prev;
      ok = true;
      return {
        ...prev,
        tokens: prev.tokens - 1,
        stages: { ...prev.stages, [kind]: { ...s, passed: false, result: null } },
        interviews: prev.interviews.filter((i) => i.type !== kind),
      };
    });
    return ok;
  };

  const unlockTraining = () => setApp((prev) => ({ ...prev, trainingUnlocked: true }));
  const toggleSaveTraining = (id) =>
    setApp((prev) => ({
      ...prev,
      savedTraining: prev.savedTraining?.includes(id) ? prev.savedTraining.filter((x) => x !== id) : [...(prev.savedTraining || []), id],
    }));

  // ---- Interviewer portal (demo navigation preserved) ----
  const enterInterviewer = (kind = "Professional") => { setInterviewerKind(kind); setViewAs("interviewer"); };
  const exitInterviewer = () => setViewAs(role === "candidate" ? "candidate" : role);
  const enterRecruiter = () => setViewAs("recruiter");
  const enterAdmin = () => setViewAs("admin");
  const exitPortal = () => setViewAs(role === "candidate" ? "candidate" : role);

  const addInterviewerNote = async (candidateId, note) => {
    if (SUPABASE_ENABLED && supabase) {
      const id = await getUid();
      if (id) { try { await db.upsertInterviewerNote(supabase, id, candidateId, note.stage || interviewerKind, note); } catch { /* ignore */ } }
    }
    setApp((prev) => ({ ...prev, interviewerNotes: { ...prev.interviewerNotes, [candidateId]: { ...note, date: new Date().toISOString() } } }));
  };

  // Staff onboarding: upload a CV / organisational document to staff-docs and
  // attach it to the staff application.
  const uploadStaffDoc = async (file) => {
    if (!(SUPABASE_ENABLED && supabase)) return {};
    const id = await getUid();
    if (!id) return { error: "Not signed in" };
    try {
      const path = await db.uploadStaffDocFile(supabase, id, file);
      await db.attachStaffDoc(supabase, id, { docPath: path, docName: file.name });
      return {};
    } catch (e) {
      return { error: e.message || String(e) };
    }
  };

  const recordAiFinal = (candidateId, summary) =>
    setApp((prev) => ({ ...prev, aiFinal: { ...prev.aiFinal, [candidateId]: { ...summary, at: new Date().toISOString() } } }));

  return (
    <AuthContext.Provider
      value={{
        signup, updateSignup, user, role, login, loginDemo, signUpUser, verifyEmailOtp, resendConfirmation, completeSignup, logout, hydrated,
        app, uploadCv, clearCv, scheduleInterview, addLocalInterviews, cancelInterview, recordAiAttempt, completeStage, retryStage,
        unlockTraining, toggleSaveTraining, viewAs, interviewerKind, approvalStatus, uploadStaffDoc, refreshApp,
        enterInterviewer, exitInterviewer, enterRecruiter, enterAdmin, exitPortal, addInterviewerNote, recordAiFinal,
        supabaseEnabled: SUPABASE_ENABLED,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
