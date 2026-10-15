"use client";

import { useState } from "react";
import { IconBell } from "@/components/Icons";

// Sends the candidate a reminder of where they are and what to do next.
export default function RemindButton({ candidateId, name, supabaseEnabled, label = "Remind" }) {
  const [state, setState] = useState(""); // "" | busy | sent | error text
  const go = async () => {
    if (state === "busy") return;
    if (!supabaseEnabled) { setState("sent"); return; }
    setState("busy");
    try {
      const r = await fetch("/api/admin/remind", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ candidateIds: [candidateId] }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setState(j.sent ? "sent" : (j.results?.[0]?.reason || "Nothing to remind"));
    } catch (e) { setState(e.message); }
  };
  const sent = state === "sent";
  return (
    <button className={`mini-btn ghost ${sent ? "ok" : ""}`} onClick={go} disabled={state === "busy" || sent}
      title={sent ? `Reminder sent to ${name}` : state && state !== "busy" ? state : `Email ${name} their current status and next step`}>
      <IconBell width={13} height={13} /> {state === "busy" ? "Sending…" : sent ? "Reminded" : label}
    </button>
  );
}

