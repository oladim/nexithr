"use client";

import { NOTIFICATIONS } from "@/components/interviewer/data";
import { IconBell, IconCheck } from "@/components/Icons";

export default function InterviewerNotifications() {
  return (
    <>
      <div className="page-head">
        <h1>Notification</h1>
        <p>Interview requests and account updates.</p>
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
