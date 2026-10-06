"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { IconCheck, IconChart } from "@/components/Icons";

// Admin AI-result review queue — only relevant when "hold results for approval"
// is enabled in Settings.
export default function AdminAiResults() {
  const { supabaseEnabled } = useAuth();
  const [rows, setRows] = useState(supabaseEnabled ? null : []);
  const [busy, setBusy] = useState(null);
  const [flash, setFlash] = useState("");

  const load = async () => {
    if (!supabaseEnabled) { setRows([]); return; }
    try {
      const res = await fetch("/api/admin/ai-results");
      const data = await res.json();
      setRows(res.ok ? data.pending : []);
    } catch { setRows([]); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [supabaseEnabled]);

  const act = async (candidateId, action) => {
    setBusy(candidateId + action);
    try {
      const res = await fetch("/api/admin/ai-results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId, action }),
      });
      const data = await res.json();
      if (!res.ok) { setFlash(data.error || "Failed"); }
      else { setRows((list) => (list || []).filter((r) => r.candidateId !== candidateId)); setFlash(action === "override_ready" ? "Marked ready and released." : "Report released to candidate."); setTimeout(() => setFlash(""), 5000); }
    } catch { setFlash("Failed"); }
    setBusy(null);
  };

  return (
    <>
      <div className="page-head">
        <h1>AI Results — review queue</h1>
        <p>When &quot;hold results for approval&quot; is on (Settings), AI diagnostics wait here until you release them. Release as-is, or override to Ready.</p>
      </div>

      {flash && <div className="role-note ok" style={{ marginBottom: 16 }}>{flash}</div>}

      <div className="card pad">
        {rows === null ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Nothing awaiting review. (Turn on holding in Settings to use this queue.)</p>
        ) : (
          <table className="tbl">
            <thead><tr><th>Candidate</th><th>Score</th><th>Band</th><th>Summary</th><th>Action</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.candidateId}>
                  <td><b>{r.name}</b><div style={{ fontSize: 12, color: "var(--muted)" }}>{r.email}</div></td>
                  <td>{r.score != null ? `${r.score}%` : "—"}</td>
                  <td><span className={`pill-status ${r.band === "ready" ? "done" : "pending"}`}>{r.band || "—"}</span></td>
                  <td style={{ maxWidth: 340, fontSize: 13 }}>{r.summary}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button className="mini-btn" disabled={busy} onClick={() => act(r.candidateId, "release")}><IconCheck width={13} height={13} /> Release</button>
                      <button className="mini-btn" disabled={busy} onClick={() => act(r.candidateId, "override_ready")}><IconChart width={13} height={13} /> Override → Ready</button>
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
