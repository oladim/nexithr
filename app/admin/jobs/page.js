"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadJobs, createJob, updateJob, deleteJob } from "@/lib/db";
import JobForm from "@/components/JobForm";
import ApplicantsPanel from "@/components/ApplicantsPanel";
import { IconPlus, IconCheck, IconX, IconPeople } from "@/components/Icons";

const DEMO = [
  { id: "j1", title: "Frontend Engineer", company: "Paystack", type: "Full-time", location: "Lagos", salary: "₦600k–₦900k", status: "approved" },
  { id: "j2", title: "Backend Engineer", company: "TechCorp", type: "Full-time", location: "Remote", salary: "Competitive", status: "pending" },
];

export default function AdminJobs() {
  const { supabaseEnabled } = useAuth();
  const [jobs, setJobs] = useState(supabaseEnabled ? null : DEMO);
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState("");
  const [viewing, setViewing] = useState(null); // job whose applicants we're viewing
  const sb = () => getBrowserSupabase();

  const load = async () => { if (!supabaseEnabled) { setJobs(DEMO); return; } setJobs(await loadJobs(sb())); };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  const setStatus = async (j, status) => {
    if (supabaseEnabled) { const { error } = await updateJob(sb(), j.id, { status }); if (error) { setErr(error.message); return; } }
    setJobs((list) => list.map((x) => (x.id === j.id ? { ...x, status } : x)));
  };
  const remove = async (j) => { if (!confirm(`Delete "${j.title}"?`)) return; if (supabaseEnabled) { const { error } = await deleteJob(sb(), j.id); if (error) { setErr(error.message); return; } } setJobs((list) => list.filter((x) => x.id !== j.id)); };

  const add = async (draft) => {
    setErr("");
    if (!draft.title.trim()) { setErr("Title is required."); return; }
    if (supabaseEnabled) {
      const { data: { user } } = await sb().auth.getUser();
      const { data, error } = await createJob(sb(), { ...draft, status: "approved", posted_by: user?.id || null });
      if (error) { setErr(error.message); return; }
      setJobs((list) => [data, ...(list || [])]);
    } else {
      setJobs((list) => [{ ...draft, id: `tmp_${Date.now()}`, status: "approved" }, ...(list || [])]);
    }
    setAdding(false);
  };

  return (
    <>
      <div className="page-head">
        <h1>Job Board — manage</h1>
        <p>Approve employer submissions and post NexIT openings. Approved jobs are visible to candidates; board-ready candidates can apply.</p>
      </div>
      <div className="rr-top">
        <span className="cvr-count">{(jobs || []).length} jobs · {(jobs || []).filter((j) => j.status === "pending").length} pending</span>
        {!adding && <button className="btn-solid" onClick={() => setAdding(true)}><IconPlus width={14} height={14} /> Post job</button>}
      </div>
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}
      {adding && <JobForm onCancel={() => setAdding(false)} onSave={add} />}

      <div className="card pad">
        {jobs === null ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p> : jobs.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No jobs yet.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Title</th><th>Company</th><th>Type</th><th>Location</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {jobs.map((j) => (
                <tr key={j.id}>
                  <td><b>{j.title}</b></td>
                  <td>{j.company || "—"}</td>
                  <td>{j.type || "—"}</td>
                  <td>{j.location || "—"}</td>
                  <td><span className={`pill-status ${j.status === "approved" ? "done" : "pending"}`}>{j.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button className="mini-btn" onClick={() => setViewing(j)}><IconPeople width={13} height={13} /> Applicants</button>
                      {j.status !== "approved" && <button className="mini-btn" onClick={() => setStatus(j, "approved")}><IconCheck width={13} height={13} /> Approve</button>}
                      {j.status !== "closed" && <button className="mini-btn" onClick={() => setStatus(j, "closed")}>Close</button>}
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
