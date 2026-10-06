"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadMyJobs, createJob, deleteJob } from "@/lib/db";
import JobForm from "@/components/JobForm";
import ApplicantsPanel from "@/components/ApplicantsPanel";
import { IconPlus, IconX, IconPeople } from "@/components/Icons";

export default function RecruiterJobs() {
  const { supabaseEnabled } = useAuth();
  const [jobs, setJobs] = useState(supabaseEnabled ? null : []);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");
  const [viewing, setViewing] = useState(null);
  const sb = () => getBrowserSupabase();

  const load = async () => {
    if (!supabaseEnabled) { setJobs([]); return; }
    try { const { data: { user } } = await sb().auth.getUser(); setJobs(user ? await loadMyJobs(sb(), user.id) : []); } catch { setJobs([]); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  const add = async (draft) => {
    setErr("");
    if (!draft.title.trim()) { setErr("Title is required."); return; }
    if (supabaseEnabled) {
      const { data: { user } } = await sb().auth.getUser();
      if (!user) { setErr("Please sign in."); return; }
      const { data, error } = await createJob(sb(), { ...draft, status: "pending", posted_by: user.id });
      if (error) { setErr(error.message); return; }
      setJobs((list) => [data, ...(list || [])]);
    } else {
      setJobs((list) => [{ ...draft, id: `tmp_${Date.now()}`, status: "pending" }, ...(list || [])]);
    }
    setAdding(false);
  };
  const remove = async (j) => { if (!confirm(`Delete "${j.title}"?`)) return; if (supabaseEnabled) { const { error } = await deleteJob(sb(), j.id); if (error) { setErr(error.message); return; } } setJobs((list) => list.filter((x) => x.id !== j.id)); };

  return (
    <>
      <div className="page-head">
        <h1>Post a Job</h1>
        <p>Share an opening with NexIT&apos;s vetted, board-ready candidates. Submissions go live once an admin approves them.</p>
      </div>
      <div className="rr-top">
        <span className="cvr-count">{(jobs || []).length} of your jobs</span>
        {!adding && <button className="btn-solid" onClick={() => setAdding(true)}><IconPlus width={14} height={14} /> Post job</button>}
      </div>
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}
      {adding && <JobForm pending onCancel={() => setAdding(false)} onSave={add} />}

      <div className="card pad">
        {jobs === null ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p> : jobs.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>You haven&apos;t posted any jobs yet.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Title</th><th>Type</th><th>Location</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td><b>{j.title}</b></td>
                  <td>{j.type || "—"}</td>
                  <td>{j.location || "—"}</td>
                  <td><span className={`pill-status ${j.status === "approved" ? "done" : "pending"}`}>{j.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button className="mini-btn" onClick={() => setViewing(j)}><IconPeople width={13} height={13} /> Applicants</button>
                      <button className="mini-btn" onClick={() => remove(j)}><IconX width={13} height={13} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {viewing && <ApplicantsPanel job={viewing} demo={!supabaseEnabled} onClose={() => setViewing(null)} />}
    </>
  );
}
