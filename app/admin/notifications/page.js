"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/context/AuthContext";
import { NOTIFICATIONS } from "@/components/admin/data";
import { IconBell, IconCheck } from "@/components/Icons";

function timeAgo(iso) {
  if (!iso) return "";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

const OK_WORDS = /approved|active|released|unlocked|reactivated|passed|success|completed|confirmed|ready/i;

export default function AdminNotifications() {
  const { supabaseEnabled } = useAuth();
  const [rows, setRows] = useState(supabaseEnabled ? null : null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!supabaseEnabled) { setRows(NOTIFICATIONS.map((n) => ({ ...n, _demo: true }))); return; }
    (async () => {
      try {
        const res = await fetch("/api/admin/notifications");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load");
        setRows(data.notifications);
      } catch (e) { setErr(e.message); setRows([]); }
    })();
  }, [supabaseEnabled]);

  return (
    <>
      <div className="page-head">
        <h1>Notifications</h1>
        <p>Recent platform activity — every notification sent to candidates, interviewers and employers.</p>
      </div>
      {err && <div className="auth-error" style={{ maxWidth: 640 }}>{err}</div>}
      <div className="card pad">
        {rows === null ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>Loading…</p>
        ) : rows.length === 0 ? (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>No notifications yet.</p>
        ) : (
          <div className="notif-list">
            {rows.map((n) => {
              const ok = n._demo ? n.ok : OK_WORDS.test(n.title || "");
              return (
                <div className={`notif-item ${ok ? "ok" : ""}`} key={n.id}>
                  <span className="ni">{ok ? <IconCheck width={20} height={20} /> : <IconBell width={20} height={20} />}</span>
                  <div className="nb">
                    <h5>{n.title}{n.recipient ? <span style={{ fontWeight: 400, color: "var(--muted)" }}> · {n.recipient}</span> : null}</h5>
                    <p>{n.body}</p>
                  </div>
                  <span className="nt">{n._demo ? n.time : timeAgo(n.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
