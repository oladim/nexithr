"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadApprovedJobs, loadMyApplications } from "@/lib/db";
import { IconBriefcase, IconMapPin, IconCheck, IconLock, IconFilter, IconChevronDown } from "@/components/Icons";

const DEMO_JOBS = [
  { id: "j1", title: "Frontend Engineer", company: "Paystack", type: "Full-time", location: "Lagos (Hybrid)", salary: "₦600k–₦900k/mo", description: "Build delightful payment UIs in React. 2+ years experience." },
  { id: "j2", title: "Data Analyst", company: "Flutterwave", type: "Full-time", location: "Remote", salary: "Competitive", description: "SQL, dashboards and insight for the growth team." },
  { id: "j3", title: "DevOps Engineer", company: "Andela", type: "Contract", location: "Remote", salary: "$3k–$5k/mo", description: "CI/CD, AWS and Kubernetes for client teams." },
];

export default function JobBoardPage() {
  const { app, supabaseEnabled } = useAuth();
  const [jobs, setJobs] = useState(supabaseEnabled ? null : DEMO_JOBS);
  const [applied, setApplied] = useState({}); // jobId -> status
  const [busy, setBusy] = useState("");
  const [flash, setFlash] = useState("");
  const [type, setType] = useState("All types");

  const boardReady = !supabaseEnabled ? true : !!app.candidate?.on_board;

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      const sb = getBrowserSupabase();
      if (!sb) { setJobs([]); return; }
      setJobs(await loadApprovedJobs(sb));
      try {
        const { data: { user } } = await sb.auth.getUser();
        if (user) { const apps = await loadMyApplications(sb, user.id); const m = {}; apps.forEach((a) => (m[a.job_id] = a.status)); setApplied(m); }
      } catch { /* ignore */ }
    })();
  }, [supabaseEnabled]);

  const types = useMemo(() => ["All types", ...Array.from(new Set((jobs || []).map((j) => j.type).filter(Boolean)))], [jobs]);
  const filtered = (jobs || []).filter((j) => type === "All types" || j.type === type);

  const apply = async (job) => {
    if (!boardReady) return;
    setBusy(job.id);
    if (supabaseEnabled) {
      try {
        const res = await fetch("/api/jobs/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId: job.id }) });
        const data = await res.json();
        if (!res.ok) { setFlash(data.error || "Couldn't apply"); setBusy(""); setTimeout(() => setFlash(""), 6000); return; }
      } catch { setFlash("Couldn't apply"); setBusy(""); return; }
    }
    setApplied((m) => ({ ...m, [job.id]: "Applied" }));
    setBusy("");
    setFlash(`Applied to ${job.title}.`);
    setTimeout(() => setFlash(""), 5000);
  };

  return (
    <>
      <div className="page-head">
        <h1>Job Board</h1>
        <p>Openings from employers hiring through NexIT. {boardReady ? "You're board-ready — apply in one click." : "Browse now; applying unlocks once you're board-ready."}</p>
      </div>

      {!boardReady && (
        <div className="feedback-card" style={{ background: "rgba(255,171,0,.10)", borderColor: "rgba(255,171,0,.3)", marginBottom: 16 }}>
          <h5 style={{ marginTop: 0 }}><IconLock width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} /> Applying is for board-ready candidates</h5>
          <p style={{ margin: 0, fontSize: 14 }}>
            You can browse every opening. To apply, complete the pipeline — pass your{" "}
            <Link href="/dashboard/interview" className="link">AI, Professional and HR interviews</Link>. Once you&apos;re on the candidate board, the Apply button unlocks.
          </p>
        </div>
      )}

      {flash && <div className="role-note ok" style={{ marginBottom: 16 }}>{flash}</div>}

      <div className="filter-bar">
        <span className="lbl"><IconFilter width={18} height={18} /> Filter</span>
        <span className="cat-select">
          <select value={type} onChange={(e) => setType(e.target.value)}>
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
          <IconChevronDown width={16} height={16} />
        </span>
      </div>

      {jobs === null ? (
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading jobs…</p>
      ) : filtered.length === 0 ? (
        <div className="empty">No open jobs right now — check back soon.</div>
      ) : (
        <div className="board-grid">
          {filtered.map((job) => {
            const status = applied[job.id];
            return (
              <div className="card pad" key={job.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="pi"><IconBriefcase width={18} height={18} /></span>
                  <div>
                    <b style={{ fontSize: 15 }}>{job.title}</b>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>{job.company || "—"}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, color: "var(--muted)" }}>
                  {job.location && <span><IconMapPin width={13} height={13} style={{ verticalAlign: "-2px", marginRight: 3 }} />{job.location}</span>}
                  {job.type && <span>{job.type}</span>}
                  {job.salary && <span>{job.salary}</span>}
                </div>
                {job.description && <p style={{ margin: "2px 0 0", fontSize: 13 }}>{job.description}</p>}
                <div style={{ marginTop: "auto", paddingTop: 8 }}>
                  {status ? (
                    <span className="pill-status done"><IconCheck width={13} height={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />{status}</span>
                  ) : (
                    <button className="btn-solid" style={{ justifyContent: "center", width: "100%" }} disabled={!boardReady || busy === job.id} onClick={() => apply(job)}>
                      {busy === job.id ? "Applying…" : boardReady ? "Apply" : "Board-ready to apply"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
