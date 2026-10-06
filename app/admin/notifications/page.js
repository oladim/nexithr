"use client";

import { NOTIFICATIONS } from "@/components/admin/data";
import { IconBell, IconCheck } from "@/components/Icons";

export default function AdminNotifications() {
  return (
    <>
      <div className="page-head">
        <h1>Notifications</h1>
        <p>Platform activity and system alerts.</p>
      </div>
      <div className="card pad">
        <div className="notif-list">
          {NOTIFICATIONS.map((n) => (
            <div className={`notif-item ${n.ok ? "ok" : ""}`} key={n.id}>
              <span className="ni">{n.ok ? <IconCheck width={20} height={20} /> : <IconBell width={20} height={20} />}</span>
              <div className="nb">
                <h5>{n.title}</h5>
                <p>{n.body}</p>
              </div>
              <span className="nt">{n.time}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
