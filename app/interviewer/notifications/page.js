"use client";

import { useEffect, useState } from "react";
import { NOTIFICATIONS } from "@/components/interviewer/data";
import { IconBell, IconCheck } from "@/components/Icons";
import SettingsCrumb from "@/components/SettingsCrumb";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";

const when = (iso) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// Real notifications (demo mode shows sample ones).
export default function InterviewerNotifications() {
  const { supabaseEnabled } = useAuth();
  const [list, setList] = useState(supabaseEnabled ? null : NOTIFICATIONS.map((n) => ({ ...n, read: !!n.ok, label: n.time })));

  useEffect(() => {
    if (!supabaseEnabled) return;
    (async () => {
      try {
        const sb = getBrowserSupabase();
        const { data: { user } } = await sb.auth.getUser();
        if (!user) { setList([]); return; }
        const { data } = await sb.from("notifications").select("id, title, body, read, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
        setList((data || []).map((n) => ({ ...n, label: when(n.created_at) })));
        if ((data || []).some((n) => !n.read)) await sb.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
      } catch { setList([]); }
    })();
  }, [supabaseEnabled]);

  return (
    <>
      <SettingsCrumb current="Notifications" onlyWhenFrom />
      <div className="page-head">
        <h1>Notifications</h1>
        <p>Interview assignments, payouts and account updates.</p>
      </div>
      <div className="card pad">
        {list === null ? <p style={{ margin: 0, color: "var(--muted)" }}>Loading…</p>
          : list.length === 0 ? <p style={{ margin: 0, color: "var(--muted)" }}>You&apos;re all caught up — no notifications yet.</p>
          : (
            <div className="notif-list">
              {list.map((n) => (
                <div className={`notif-item ${n.read ? "ok" : ""}`} key={n.id}>
                  <span className="ni">{n.read ? <IconCheck width={20} height={20} /> : <IconBell width={20} height={20} />}</span>
                  <div className="nb">
                    <h5>{n.title}</h5>
                    {n.body && <p>{n.body}</p>}
                  </div>
                  <span className="nt">{n.label}</span>
                </div>
              ))}
            </div>
          )}
      </div>
    </>
  );
}
