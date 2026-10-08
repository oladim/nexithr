"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconCheck, IconX, IconFileText } from "@/components/Icons";

const DEMO = [
  { userId: "s1", name: "Grace N.", email: "grace@x.com", role: "interviewer", kind: "Professional", docName: "Grace_CV.pdf", docUrl: null, status: "pending", approvalStatus: "pending" },
  { userId: "s2", name: "TechCorp Ltd", email: "hr@techcorp.com", role: "recruiter", orgName: "TechCorp Ltd", docName: "CAC_Certificate.pdf", docUrl: null, status: "pending", approvalStatus: "pending" },
];

export default function StaffApprovals() {
  const { supabaseEnabled } = useAuth();
  const [rows, setRows] = useState(supabaseEnabled ? null : DEMO);
  const [filter, setFilter] = useState("pending");
  const [busy, setBusy] = useState("");
  const [flash, setFlash] = useState("");

  const load = async () => {
    if (!supabaseEnabled) { setRows(DEMO); return; }
    try { const res = await fetch("/api/admin/staff-approvals"); const data = await res.json(); setRows(res.ok ? data.applications : []); } catch { setRows([]); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  const STATUS_OF = { approve: "approved", reactivate: "approved", reject: "rejected", suspend: "suspended" };
  const act = async (r, action) => {
    let note = "";
    if (action === "reject" || action === "suspend") { note = window.prompt("Reason (optional) — shown to the person:", "") || ""; }
    setBusy(r.userId + action);
    if (supabaseEnabled) {
      try {
        const res = await fetch("/api/admin/staff-approvals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: r.userId, action, note }) });
        const data = await res.json();
        if (!res.ok) { setFlash(data.error || "Failed"); setBusy(""); return; }
      } catch { setFlash("Failed"); setBusy(""); return; }
    }
    const st = STATUS_OF[action];
    setRows((list) => list.map((x) => (x.userId === r.userId ? { ...x, status: st, approvalStatus: st } : x)));
    setBusy("");
    setFlash(`${r.name}: ${st}.`);
    setTimeout(() => setFlash(""), 5000);
  };

  const list = (rows || []).filter((r) => filter === "all" || r.status === filter);

  return (
    <>
      <div className="page-head">
        <h1>Staff Approvals</h1>
        <p>Review interviewer and employer sign-ups. Open their CV or organisational documents, then approve or decline.</p>
      </div>

      <div className="rr-top">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["pending", "approved", "suspended", "rejected", "all"].map((f) => (
            <button key={f} className={`mini-btn ${filter === f ? "" : ""}`} style={filter === f ? { background: "var(--navy)", color: "#fff" } : undefined} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <span className="cvr-count">{(rows || []).filter((r) => r.status === "pending").length} pending</span>
      </div>

      {flash && <div className="role-note ok" style={{ marginBottom: 16 }}>{flash}</div>}

      <div className="card pad">
        {rows === null ? <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p> : list.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Nothing here.</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Applicant</th><th>Type</th><th>Document</th><th>Status</th><th>Action</th></tr></thead>
            <tbody>
              {list.map((r) => (
                <tr key={r.userId}>
                  <td><b>{r.name}</b><div style={{ fontSize: 12, color: "var(--muted)" }}>{r.email}{r.country ? ` · ${r.country}` : ""}</div></td>
                  <td>{r.role === "recruiter" ? `Employer${r.orgName ? ` · ${r.orgName}` : ""}` : `${r.kind || "Professional"} Interviewer`}</td>
                  <td>
                    {r.docUrl ? (
                      <a href={r.docUrl} target="_blank" rel="noreferrer" className="link" style={{ fontSize: 13 }}><IconFileText width={13} height={13} style={{ verticalAlign: "-2px", marginRight: 4 }} />{r.docName || "View"}</a>
                    ) : r.docName ? <span style={{ fontSize: 13 }}>{r.docName}</span> : <span style={{ fontSize: 13, color: "var(--muted)" }}>Not uploaded</span>}
                  </td>
                  <td><span className={`pill-status ${r.status === "approved" ? "done" : "pending"}`}>{r.status}</span></td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {r.status === "pending" && (
                        <>
                          <button className="mini-btn" disabled={busy} onClick={() => act(r, "approve")}><IconCheck width={13} height={13} /> Approve</button>
                          <button className="mini-btn" disabled={busy} onClick={() => act(r, "reject")}><IconX width={13} height={13} /> Decline</button>
                        </>
                      )}
                      {r.status === "approved" && (
                        <button className="mini-btn" disabled={busy} onClick={() => act(r, "suspend")}><IconX width={13} height={13} /> Suspend</button>
                      )}
                      {(r.status === "suspended" || r.status === "rejected") && (
                        <button className="mini-btn" disabled={busy} onClick={() => act(r, "reactivate")}><IconCheck width={13} height={13} /> Reactivate</button>
                      )}
                    </div>
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
