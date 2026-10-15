"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { SUPABASE_ENABLED } from "@/lib/supabase/config";
import { isTransientAuthError } from "@/lib/supabase/authErrors";
import { getBrowserSupabase } from "@/lib/supabase/client";
import * as db from "@/lib/db";
import { computeStageResult } from "@/components/interview/stage";
import { reportEvent } from "@/lib/events";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/policy";

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
  // CV chosen during sign-up. A new account has no session until the email is
  // confirmed, so the file is kept in memory and uploaded (through the secure
  // upload API) as soon as the candidate is signed in, in this same tab.
  const pendingCvRef = useRef(null);
  const setPendingCv = (file) => { pendingCvRef.current = file || null; };
  const [viewAs, setViewAs] = useState("candidate");
  const [interviewerKind, setInterviewerKind] = useState("Professional");
  const [approvalStatus, setApprovalStatus] = useState("approved");

  const supabase = SUPABASE_ENABLED ? getBrowserSupabase() : null;

  // Load the signed-in user's profile + (if candidate) app data from Postgres.
  const bootstrapFromSupabase = useCallback(async () => {
    if (!supabase) return;
    let {
      data: { user: authUser },
      error: authErr,
    } = await supabase.auth.getUser();
    // A network blip or token-refresh race is not a sign-out: fall back to
    // the locally stored session (and retry) instead of bouncing to /login.
    if (!authUser && isTransientAuthError(authErr)) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await new Promise((r) => setTimeout(r, 400));
        ({ data: { user: authUser }, error: authErr } = await supabase.auth.getUser());
        if (!authUser) authUser = session.user;
      }
    }
    if (!authUser) {
      // Definitively invalid (expired/revoked) → clear the stale local
      // session too, so nothing keeps thinking we're signed in.
      if (authErr && !isTransientAuthError(authErr)) {
        try { await supabase.auth.signOut({ scope: "local" }); } catch { /* ignore */ }
      }
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
    // First sign-in on this browser → tell the team about the new account
    // (the server emails once per user, so repeats are harmless).
    if (r !== "admin") {
      try {
        const k = `nexit.reg.${authUser.id}`;
        if (!localStorage.getItem(k)) { reportEvent("registered"); localStorage.setItem(k, "1"); }
      } catch { /* storage unavailable */ }
    }
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
      // Only a real SIGNED_OUT clears the user. Token refreshes and the
      // initial-session event must not reload or wipe anything (they fire on
      // tab focus and refresh races and caused random "signed out" bounces).
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setApp(emptyApp);
        } else if (event === "SIGNED_IN" || event === "USER_UPDATED") {
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
            privacy_accepted_version: signup.agreeTerms ? PRIVACY_VERSION : null,
            terms_accepted_version: signup.agreeTerms ? TERMS_VERSION : null,
          },
        },
      });
      if (error) return { error: error.message };
      // If a session came back, email confirmation is OFF → already signed in.
      if (data?.session) {
        await bootstrapFromSupabase();
        return { needsConfirm: false };
      }
      // Admin switched email verification off → the server confirms this
      // brand-new account and we sign straight in.
      if (data?.user?.id) {
        try {
          const r = await fetch("/api/auth/autoconfirm", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: data.user.id }),
          });
          const j = await r.json().catch(() => ({}));
          if (r.ok && j.confirmed) {
            const { error: sErr } = await supabase.auth.signInWithPassword({ email: signup.email, password: signup.password });
            if (!sErr) { await bootstrapFromSupabase(); return { needsConfirm: false }; }
          }
        } catch { /* fall back to email confirmation */ }
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
    // Demo only: there's no backend, so the chosen CV is recorded locally. On
    // the live platform a CV exists only once it's really uploaded and stored.
    if (!SUPABASE_ENABLED && signup.cvName) {
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

  // Before a portal bounces someone to /login, double-check: is there really
  // no session? If one exists (the earlier check hit a blip), reload instead.
  const confirmSignedOut = useCallback(async () => {
    if (!(SUPABASE_ENABLED && supabase)) return true;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return true;
      await bootstrapFromSupabase();
      return false;
    } catch { return true; }
  }, [supabase, bootstrapFromSupabase]);

  // Helper to get the current auth user id in REAL mode.
  const getUid = useCallback(async () => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data?.user?.id || null;
  }, [supabase]);

  // ---- CV ----
  // Uploads go through /api/cv/upload, which checks the real file on the
  // server (PDF/DOCX only, no scripts/macros, must open) before filing it.
  // Returns { error } or { warning } for the CV page to show.
  const uploadCv = async (cv) => {
    let saved = null;
    let warning = null;
    if (SUPABASE_ENABLED && supabase) {
      if (!cv.file) return { error: "Choose a PDF or Word (.docx) file to upload." };
      const call = async (payload) => {
        const r = await fetch("/api/cv/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const j = await r.json().catch(() => ({}));
        return r.ok ? j : { error: j.error || `Upload failed (${r.status}).` };
      };
      const start = await call({ step: "start", name: cv.file.name, size: cv.file.size });
      if (start.error) return { error: start.error };
      const { error: upErr } = await supabase.storage.from("cvs").uploadToSignedUrl(start.path, start.token, cv.file, { contentType: start.contentType });
      if (upErr) return { error: /size|exceed/i.test(upErr.message) ? "Your CV is larger than 5 MB." : `Upload failed: ${upErr.message}` };
      const fin = await call({ step: "finish", path: start.path, name: cv.file.name, industry: cv.industry, jobType: cv.jobType });
      if (fin.error) return { error: fin.error };
      saved = fin.cv;
      warning = fin.warning || null;
    }
    setApp((prev) => ({
      ...prev,
      cv: saved || { name: cv.name || "cv.pdf", uploadedAt: new Date().toISOString(), industry: cv.industry || "", jobType: cv.jobType || "Full-time", status: "Pending review" },
    }));
    return warning ? { warning } : {};
  };
  // Delete the CV for the active role (only before the AI interview starts).
  const deleteCv = async () => {
    if (SUPABASE_ENABLED && supabase) {
      const r = await fetch("/api/cv/upload", { method: "DELETE" });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return { error: j.error || "Couldn't delete the CV." };
    } else if (app.aiInterview?.attempts > 0) {
      return { error: "Your AI interview has already started, so your CV can't be deleted." };
    }
    setApp((prev) => ({ ...prev, cv: null }));
    return {};
  };
  const clearCv = () => setApp((prev) => ({ ...prev, cv: null }));

  // Upload the CV picked at sign-up once the new candidate is signed in.
  const [pendingCvState, setPendingCvState] = useState(null); // null | uploading | done | error text
  useEffect(() => {
    const f = pendingCvRef.current;
    if (!f || !SUPABASE_ENABLED || !hydrated || !user || role !== "candidate") return;
    if (app.cv) { pendingCvRef.current = null; return; }
    pendingCvRef.current = null;
    setPendingCvState("uploading");
    uploadCv({ name: f.name, file: f, jobType: signup.jobType || "Full-time" })
      .then((r) => setPendingCvState(r?.error ? r.error : "done"))
      .catch((e) => setPendingCvState(e?.message || "Upload failed"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user, role, app.cv]);

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
      reportEvent("staff_docs");
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
        signup, updateSignup, user, role, confirmSignedOut, login, loginDemo, signUpUser, verifyEmailOtp, resendConfirmation, completeSignup, logout, hydrated,
        app, uploadCv, deleteCv, clearCv, setPendingCv, pendingCvState, scheduleInterview, addLocalInterviews, cancelInterview, recordAiAttempt, completeStage, retryStage,
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
