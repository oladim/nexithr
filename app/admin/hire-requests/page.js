"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadHireRequests, updateHireRequest } from "@/lib/db";

const DEMO = [
  { id: "d1", position: "Backend Engineer", status: "requested", message: "Keen on this candidate.", created_at: new Date().toISOString(), candidate: { profiles: { full_name: "Ada Obi", email: "ada@nexit.africa" } }, recruiter: { full_name: "TechCorp HR", email: "hr@techcorp.com" } },
];
const STATUSES = ["requested", "accepted", "declined", "placed"];

export default function AdminHireRequests() {
  const { supabaseEnabled } = useAuth();
  const [rows, setRows] = useState(supabaseEnabled ? null : DEMO);
  const [err, setErr] = useState("");
  const sb = () => getBrowserSupabase();

  const load = async () => {
    if (!supabaseEnabled) { setRows(DEMO); return; }
    try { setRows(await loadHireRequests(sb())); } catch { setRows([]); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  const setStatus = async (r, status) => {
    if (supabaseEnabled) { const { error } = await updateHireRequest(sb(), r.id, status); if (error) { setErr(error.message); return; } }
    setRows((list) => list.map((x) => (x.id === r.id ? { ...x, status } : x)));
  };

  return (
    <>
      <div className="page-head">
        <h1>Hire Requests</h1>
        <p>Employers requesting to hire board-ready candidates. Mark a request <b>placed</b> when a hire completes (triggers your placement fee).</p>
      </div>
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}
      <div className="card pad">
        {rows === null ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p> : rows.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No hire requests yet.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Candidate</th><th>Employer</th><th>Position</th><th>Status</th><th>Set status</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td><b>{r.candidate?.profiles?.full_name || "Candidate"}</b><div style={{ fontSize: 12, color: "var(--muted)" }}>{r.candidate?.profiles?.email}</div></td>
                  <td>{r.recruiter?.full_name || "Employer"}<div style={{ fontSize: 12, color: "var(--muted)" }}>{r.recruiter?.email}</div></td>
                  <td>{r.position || "—"}</td>
                  <td><span className={`pill-status ${r.status === "placed" || r.status === "accepted" ? "done" : "pending"}`}>{r.status}</span></td>
                  <td>
                    <select className="rr-exp-input" value={r.status} onChange={(e) => setStatus(r, e.target.value)}>
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
