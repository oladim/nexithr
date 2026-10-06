"use client";

import { useState } from "react";
import { REQUESTS } from "@/components/admin/data";

export default function AdminRequests() {
  const [rows, setRows] = useState(REQUESTS);
  const decide = (id, status) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <>
      <div className="page-head">
        <h1>Requests</h1>
        <p>Approve interviewer and recruiter applications, and payout requests.</p>
      </div>
      <div className="card pad">
        <table className="tbl">
          <thead>
            <tr><th>Name</th><th>Type</th><th>Role</th><th>Date</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.type}</td>
                <td>{r.role}</td>
                <td>{r.date}</td>
                <td>
                  <span className={`pill-status ${r.status === "Approved" ? "done" : r.status === "Declined" ? "pending" : "pending"}`} style={r.status === "Declined" ? { background: "rgba(255,59,48,.12)", color: "#c0392b" } : undefined}>
                    {r.status}
                  </span>
                </td>
                <td>
                  {r.status === "Pending" ? (
                    <span className="req-actions">
                      <button className="req-approve" onClick={() => decide(r.id, "Approved")}>Approve</button>
                      <button className="req-decline" onClick={() => decide(r.id, "Declined")}>Decline</button>
                    </span>
                  ) : (
                    <span style={{ color: "var(--gray-500)", fontSize: 13 }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
