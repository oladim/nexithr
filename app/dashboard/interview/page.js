"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/context/AuthContext";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { loadInterviewerNames, mapScheduledRow, ROLE_LABELS } from "@/lib/db";
import { googleCalendarAddUrl } from "@/lib/billing";
import InterviewJourney from "@/components/interview/InterviewJourney";
import {
  IconChart, IconUser, IconBriefcase, IconVideo, IconMapPin, IconClock,
  IconCheck, IconPlus, IconCalendar, IconPlay, IconLock, IconChevronRight,
} from "@/components/Icons";

// The three human-interview options (AI is launched live, not scheduled here).
const TYPES = [
  { id: "Professional", label: "Professional Interview", desc: "A human expert in your field interviews you.", Icon: IconUser, stages: ["Professional"] },
  { id: "HR", label: "HR Interview", desc: "Final interview with a human HR professional.", Icon: IconBriefcase, stages: ["HR"] },
  { id: "Combined", label: "Professional + HR (same call)", desc: "Do both interviews back-to-back in a single call.", Icon: IconUser, stages: ["Professional", "HR"] },
];

const DUR_MIN = 45;
const START_HOURS = [9, 11, 13, 15];

// Real upcoming weekday slots with real ISO start times.
function upcomingSlots(n = 6) {
  const out = [];
  const d = new Date();
  let guard = 0;
  while (out.length < n && guard < 40) {
    guard += 1;
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) continue;
    const hour = START_HOURS[out.length % START_HOURS.length];
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 0, 0, 0);
    const end = new Date(start.getTime() + DUR_MIN * 60 * 1000);
    out.push({
      startISO: start.toISOString(),
      day: start.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }),
      time: `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
    });
  }
  return out;
}

export default function InterviewPage() {
  const { signup, app, addLocalInterviews, cancelInterview, supabaseEnabled } = useAuth();
  const [step, setStep] = useState(0);
  const [typeId, setTypeId] = useState("");
  const [mode, setMode] = useState("Virtual");
  const [slot, setSlot] = useState(null);
  const [panel, setPanel] = useState({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [booked, setBooked] = useState(null); // success payload w/ meet link

  const SLOTS = useMemo(() => upcomingSlots(6), []);

  useEffect(() => {
    if (!supabaseEnabled) return;
    const sb = getBrowserSupabase();
    if (!sb) return;
    loadInterviewerNames(sb).then(setPanel).catch(() => {});
  }, [supabaseEnabled]);

  // Eligibility from the candidate's real progress.
  const aiPassed = !!app.aiInterview?.passed;
  const proPassed = !!app.stages?.Professional?.passed;
  const eligibility = {
    Professional: aiPassed,
    HR: proPassed,
    Combined: aiPassed,
  };
  const reasonFor = (id) =>
    id === "Professional" ? "Pass the AI interview first" : id === "HR" ? "Pass the Professional interview first" : "Pass the AI interview first";

  // Interviewers are assigned by NexIT after the booking is made.
  const interviewerFor = () => "Assigned by NexIT after booking";

  const role = ROLE_LABELS[app.candidate?.target_role] || ROLE_LABELS[signup.targetRole] || signup.jobTitle || "Your selected role";
  const chosen = TYPES.find((t) => t.id === typeId);

  const reset = () => { setStep(0); setTypeId(""); setMode("Virtual"); setSlot(null); setErr(""); setBooked(null); };

  const confirm = async () => {
    setErr(""); setBusy(true);
    const stages = chosen.stages;
    try {
      if (supabaseEnabled) {
        const res = await fetch("/api/interview/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stages, startISO: slot.startISO, mode, role }),
        });
        const data = await res.json();
        if (!res.ok) { setErr(data.error || "Couldn't schedule"); setBusy(false); return; }
        if (Array.isArray(data.interviews)) addLocalInterviews(data.interviews.map(mapScheduledRow));
        setBooked(data);
      } else {
        // Demo: create a mock Meet link locally.
        const code = Math.random().toString(36).slice(2, 5) + "-" + Math.random().toString(36).slice(2, 6) + "-" + Math.random().toString(36).slice(2, 5);
        const meetLink = `https://meet.google.com/${code}`;
        const bookingGroup = `bg_${Date.now()}`;
        const items = stages.map((stage) => ({
          id: `int_${Date.now()}_${stage}`, type: stage, mode: stage === "HR" ? "HR In-House" : mode, role,
          date: slot.day, time: slot.time, interviewer: interviewerFor(stage === "HR" ? "HR" : "Professional"), status: "Confirmed", meetLink, bookingGroup,
        }));
        addLocalInterviews(items);
        setBooked({ meetLink, mock: true, combined: stages.length > 1, stages, dateText: slot.day, timeText: slot.time, startISO: slot.startISO, endISO: new Date(new Date(slot.startISO).getTime() + DUR_MIN * 60000).toISOString(), invited: [interviewerFor("Professional")] });
      }
      setStep(3);
    } catch (e) {
      setErr(e.message);
    }
    setBusy(false);
  };

  const calUrl = booked
    ? googleCalendarAddUrl({ summary: `NexIT ${booked.combined ? "Professional + HR" : booked.stages?.[0]} interview`, details: `Join: ${booked.meetLink}`, startISO: booked.startISO, endISO: booked.endISO })
    : "#";

  // Group scheduled interviews so a combined booking shows once.
  const grouped = useMemo(() => {
    const seen = new Set(); const out = [];
    for (const it of app.interviews) {
      const key = it.bookingGroup || it.id;
      if (it.bookingGroup) {
        if (seen.has(it.bookingGroup)) { const g = out.find((o) => o.bookingGroup === it.bookingGroup); if (g) g.types.push(it.type); continue; }
        seen.add(it.bookingGroup);
      }
      out.push({ ...it, types: [it.type], key });
    }
    return out;
  }, [app.interviews]);

  return (
    <>
      <div className="page-head">
        <h1>Interview Scheduling</h1>
        <p>Book your Professional and HR interviews. They run on Google Meet — your link appears here once booked.</p>
      </div>

      <InterviewJourney />

      {/* AI reminder — AI isn't scheduled, it's taken live */}
      <div className="card pad" style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap", margin: "16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="pi"><IconChart /></span>
          <div>
            <b>AI interview</b>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {aiPassed ? "Completed — you can book a human interview below." : "Take this first — it's instant and unlocks the human interviews."}
            </div>
          </div>
        </div>
        {!aiPassed && (
          <Link href="/dashboard/interview/ai" className="btn-solid" style={{ padding: "8px 16px", fontSize: 13 }}>
            <IconPlay width={14} height={14} /> Start AI interview
          </Link>
        )}
      </div>

      {step < 3 && (
        <div className="sched-steps">
          <span className={`s ${step >= 0 ? "on" : ""}`} />
          <span className={`s ${step >= 1 ? "on" : ""}`} />
          <span className={`s ${step >= 2 ? "on" : ""}`} />
        </div>
      )}

      {/* Step 1 — type + mode */}
      {step === 0 && (
        <>
          <h3 className="card-title">1. Which interview?</h3>
          <div className="type-grid">
            {TYPES.map(({ id, label, desc, Icon, stages }) => {
              const ok = eligibility[id];
              return (
                <button
                  key={id}
                  className={`type-card ${typeId === id ? "sel" : ""}`}
                  onClick={() => ok && setTypeId(id)}
                  disabled={!ok}
                  style={!ok ? { opacity: 0.55, cursor: "not-allowed" } : undefined}
                  title={!ok ? reasonFor(id) : undefined}
                >
                  <span className="ti">{ok ? <Icon width={22} height={22} /> : <IconLock width={20} height={20} />}</span>
                  <h4>{label}</h4>
                  <p>{ok ? desc : reasonFor(id)}</p>
                </button>
              );
            })}
          </div>

          {typeId && typeId !== "HR" && (
            <>
              <h3 className="card-title">2. In-person or virtual?</h3>
              <div className="mode-toggle" style={{ marginBottom: 28 }}>
                <button className={mode === "Virtual" ? "on" : ""} onClick={() => setMode("Virtual")}><IconVideo /> Virtual (Google Meet)</button>
                <button className={mode === "In-person" ? "on" : ""} onClick={() => setMode("In-person")}><IconMapPin /> In-person</button>
              </div>
            </>
          )}

          <button className="btn-solid" disabled={!typeId} onClick={() => setStep(1)}>Continue</button>
        </>
      )}

      {/* Step 2 — pick slot */}
      {step === 1 && (
        <>
          <h3 className="card-title">Choose an available time</h3>
          <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--gray-500)" }}>Next available slots for the <b>{role}</b> role.</p>
          <div className="slot-cols">
            <div className="slot-list">
              {SLOTS.map((s) => (
                <button key={s.startISO} className={`slot ${slot?.startISO === s.startISO ? "sel" : ""}`} onClick={() => setSlot(s)}>
                  <IconClock /><span className="d">{s.day}</span><span className="t">{s.time}</span>
                </button>
              ))}
            </div>
            <div className="card pad">
              <h3 className="card-title">Summary</h3>
              <SummaryRows rows={[
                ["Interview", chosen?.label],
                ["Role", role],
                ["Mode", typeId === "HR" ? "HR In-House" : mode],
                ["Interviewer", interviewerFor(typeId)],
                ["Time", slot ? `${slot.day}, ${slot.time}` : "—"],
              ]} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
            <button className="btn-outline" onClick={() => setStep(0)}>Back</button>
            <button className="btn-solid" disabled={!slot} onClick={() => setStep(2)}>Review</button>
          </div>
        </>
      )}

      {/* Step 3 — review/confirm */}
      {step === 2 && (
        <>
          <h3 className="card-title">Confirm your interview</h3>
          <div className="confirm-card">
            <div className="rows" style={{ paddingTop: 16 }}>
              <Row k="Interview" v={chosen?.label} />
              <Row k="Role" v={role} />
              <Row k="Date & Time" v={`${slot.day}, ${slot.time}`} />
              <Row k="Mode" v={typeId === "HR" ? "HR In-House" : mode} />
              <Row k="Interviewer" v={interviewerFor(typeId)} />
            </div>
            {err && <div className="auth-error" style={{ margin: "0 16px" }}>{err}</div>}
            <div className="cf">
              <button className="btn-outline" onClick={() => setStep(1)} disabled={busy}>Back</button>
              <button className="btn-solid" onClick={confirm} disabled={busy}><IconCheck /> {busy ? "Booking…" : "Confirm & create Meet"}</button>
            </div>
          </div>
        </>
      )}

      {/* Confirmed — show the Meet link */}
      {step === 3 && booked && (
        <div className="confirm-card">
          <div className="ch"><IconCheck /> Interview Confirmed</div>
          <div className="rows">
            <Row k="Interview" v={booked.combined ? "Professional + HR (same call)" : `${booked.stages?.[0]} Interview`} />
            <Row k="Role" v={role} />
            <Row k="Date & Time" v={`${booked.dateText}, ${booked.timeText}`} />
          </div>
          <div style={{ padding: "4px 16px 0" }}>
            <div className="feedback-card" style={{ background: "rgba(0,123,255,.07)", borderColor: "rgba(0,123,255,.25)" }}>
              <h5 style={{ marginTop: 0 }}><IconVideo width={16} height={16} style={{ display: "inline", verticalAlign: "-3px", marginRight: 6 }} /> Your Google Meet link</h5>
              <a href={booked.meetLink} target="_blank" rel="noreferrer" style={{ fontWeight: 600, wordBreak: "break-all" }}>{booked.meetLink}</a>
              <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--gray-500)" }}>
                {booked.mock
                  ? "Demo link (Google Workspace not configured). An admin assigns your interviewer after booking."
                  : "Your booking is confirmed. We'll assign your interviewer and notify you — they'll join on this link."}
              </p>
            </div>
          </div>
          <div className="cf">
            <a className="btn-outline" href={calUrl} target="_blank" rel="noreferrer"><IconCalendar width={16} height={16} /> Add to my calendar</a>
            <button className="btn-solid" onClick={reset}><IconPlus /> Schedule another</button>
          </div>
        </div>
      )}

      {/* Scheduled interviews list */}
      {step < 3 && (
        <div style={{ marginTop: 36 }}>
          <h3 className="card-title">Your scheduled interviews</h3>
          {grouped.length === 0 ? (
            <div className="empty">No interviews scheduled yet — pick one above to get started.</div>
          ) : (
            <div className="sched-list">
              {grouped.map((it) => {
                const isCombined = it.types.length > 1;
                return (
                  <div className="sched-item" key={it.key}>
                    <span className={`badge2 ${it.type === "Professional" ? "pro" : "hr"}`}>
                      {it.type === "Professional" ? <IconUser width={20} height={20} /> : <IconBriefcase width={20} height={20} />}
                    </span>
                    <div className="si">
                      <h4>{isCombined ? "Professional + HR" : `${it.type} Interview`} · {it.role}</h4>
                      <p>{it.date}, {it.time} · {it.mode} · {it.interviewer || (it.assigned ? "Interviewer assigned" : "Awaiting interviewer assignment")}</p>
                      {it.meetLink && (
                        <a href={it.meetLink} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600 }}>
                          <IconVideo width={13} height={13} style={{ display: "inline", verticalAlign: "-2px", marginRight: 4 }} /> Join Google Meet
                        </a>
                      )}
                    </div>
                    <button className="cancel" onClick={() => cancelInterview(it.id)}>Cancel</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Row({ k, v }) {
  return <div className="r"><span>{k}</span><b>{v}</b></div>;
}
function SummaryRows({ rows }) {
  return (
    <div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #f0f2f5", fontSize: 14 }}>
          <span style={{ color: "var(--gray-500)" }}>{k}</span>
          <b style={{ fontWeight: 600, textAlign: "right" }}>{v || "—"}</b>
        </div>
      ))}
    </div>
  );
}
