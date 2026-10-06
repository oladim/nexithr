"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { REQUESTS } from "@/components/admin/data";

const roleLabel = (r, kind) => (r === "interviewer" ? `${kind || "Professional"} Interviewer` : r === "recruiter" ? "Recruiter / Employer" : r);

export default function AdminRequests() {
  const { supabaseEnabled } = useAuth();
  const [rows, setRows] = useState(supabaseEnabled ? null : REQUESTS.map((r) => ({ ...r, _demo: true })));
  const [busyId, setBusyId] = useState(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    setErr("");
    try {
      const res = await fetch("/api/admin/staff-approvals");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      // Only show items still awaiting a decision.
      setRows((data.applications || []).filter((a) => a.status === "pending"));
    } catch (e) { setErr(e.message); setRows([]); }
  };
  useEffect(() => { if (supabaseEnabled) load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  const decide = async (row, action) => {
    if (row._demo) { setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status: action === "approve" ? "Approved" : "Declined" } : r))); return; }
    setBusyId(row.userId); setErr(""); setMsg("");
    try {
      const res = await fetch("/api/admin/staff-approvals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: row.userId, action }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMsg(`${row.name} ${action === "approve" ? "approved" : "declined"}.`);
      await load();
    } catch (e) { setErr(e.message); } finally { setBusyId(null); }
  };

  return (
    <>
      <div className="page-head">
        <h1>Requests</h1>
        <p>Pending interviewer and recruiter applications awaiting your decision. Need the full documents? Open <Link href="/admin/staff-approvals" className="link">Staff Approvals</Link>.</p>
      </div>

      {msg && <div className="role-note ok">{msg}</div>}
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}

      <div className="card pad">
        {rows === null ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No pending requests — you&apos;re all caught up.</p>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Name</th><th>Type</th><th>Role</th><th>Date</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const demo = r._demo;
                const name = demo ? r.name : r.name;
                const type = demo ? r.type : "Application";
                const role = demo ? r.role : roleLabel(r.role, r.kind);
                const date = demo ? r.date : (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—");
                const status = demo ? r.status : "Pending";
                const key = demo ? r.id : r.userId;
                return (
                  <tr key={key}>
                    <td>{name}{!demo && r.orgName ? <span style={{ color: "var(--muted)", fontSize: 12 }}> · {r.orgName}</span> : null}</td>
                    <td>{type}</td>
                    <td>{role}</td>
                    <td>{date}</td>
                    <td>
                      <span className={`pill-status ${status === "Approved" ? "done" : "pending"}`} style={status === "Declined" ? { background: "rgba(255,59,48,.12)", color: "#c0392b" } : undefined}>{status}</span>
                    </td>
                    <td>
                      {status === "Pending" ? (
                        <span className="req-actions">
                          <button className="req-approve" disabled={busyId === r.userId} onClick={() => decide(r, "approve")}>Approve</button>
                          <button className="req-decline" disabled={busyId === r.userId} onClick={() => decide(r, "reject")}>Decline</button>
                        </span>
                      ) : (
                        <span style={{ color: "var(--gray-500)", fontSize: 13 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
