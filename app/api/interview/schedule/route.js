import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSessionProfile } from "@/lib/supabase/server";
import { getServiceSupabase } from "@/lib/supabase/admin";
import { createMeetEvent } from "@/lib/google";
import { ROLE_LABELS } from "@/lib/db";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";

// POST /api/interview/schedule
// { stages: ["Professional"] | ["HR"] | ["Professional","HR"], startISO, mode, role }
// Enforces prerequisites, creates ONE Google Meet, and books each stage (a
// combined booking is two rows sharing the meet link). Returns the meet link.
// Bookings are created UNASSIGNED — an admin then assigns the Professional /
// HR interviewer from the Interview Manager (see /api/admin/interviews).
export async function POST(request) {
  const me = await getSessionProfile();
  if (!me) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const stages = Array.isArray(body?.stages) ? body.stages.filter((s) => ["Professional", "HR"].includes(s)) : [];
  const startISO = body?.startISO;
  const mode = body?.mode || "Virtual";
  if (stages.length === 0) return NextResponse.json({ error: "Pick at least one stage" }, { status: 400 });
  if (!startISO || isNaN(new Date(startISO).getTime())) return NextResponse.json({ error: "A valid start time is required" }, { status: 400 });

  const admin = getServiceSupabase();
  if (!admin) return NextResponse.json({ error: "Server not configured" }, { status: 500 });

  // ---- Prerequisites ----
  const { data: ai } = await admin.from("ai_interviews").select("passed").eq("candidate_id", me.id).maybeSingle();
  const aiPassed = !!ai?.passed;
  const { data: proAttempts } = await admin.from("stage_attempts").select("passed").eq("candidate_id", me.id).eq("stage", "Professional").eq("passed", true).limit(1);
  const proPassed = (proAttempts || []).length > 0;

  const combined = stages.includes("Professional") && stages.includes("HR");
  if (!aiPassed) {
    return NextResponse.json({ error: "Complete the AI interview first — it must be passed before booking a human interview." }, { status: 403 });
  }
  // Booking HR alone requires Professional already passed. A combined call books
  // both together, so Professional-passed is not required for it.
  if (stages.includes("HR") && !combined && !proPassed) {
    return NextResponse.json({ error: "Complete the Professional interview first before booking HR." }, { status: 403 });
  }

  // ---- Candidate + role + interviewer attendees ----
  const { data: cand } = await admin.from("candidates").select("target_role").eq("id", me.id).maybeSingle();
  const roleLabel = body?.role || ROLE_LABELS[cand?.target_role] || cand?.target_role || "the role";

  // Interviewers are assigned by an admin after booking, so only the candidate
  // is on the invite for now; the interviewer receives the link on assignment.
  const attendeeEmails = [me.email || me.authEmail].filter(Boolean);

  // ---- Create the Meet event (shared across the booking) ----
  const start = new Date(startISO);
  const end = new Date(start.getTime() + 45 * 60 * 1000);
  const label = combined ? "Professional + HR interview" : `${stages[0]} interview`;
  const meet = await createMeetEvent({
    summary: `NexIT ${label} — ${me.full_name || "Candidate"} (${roleLabel})`,
    description: `NexIT-Africa ${label} for ${me.full_name || "the candidate"} — role: ${roleLabel}.`,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    attendees: attendeeEmails,
  });
  if (meet.error) return NextResponse.json({ error: `Couldn't create the meeting: ${meet.error}` }, { status: 502 });

  // ---- Book each stage ----
  const bookingGroup = crypto.randomUUID();
  const dateText = start.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
  const timeText = `${start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} – ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  const rows = stages.map((stage) => ({
    candidate_id: me.id,
    type: stage, // 'Professional' | 'HR'
    mode: stage === "HR" ? "HR In-House" : mode,
    role: roleLabel,
    scheduled_date: dateText,
    scheduled_time: timeText,
    interviewer_id: null, // assigned by an admin
    meet_link: meet.meetLink,
    calendar_event_id: meet.eventId,
    booking_group: bookingGroup,
    status: "Confirmed",
  }));

  // Insert (with a graceful retry if the 0011 columns aren't present yet).
  let ins = await admin.from("interviews").insert(rows).select();
  if (ins.error && /column .* does not exist/i.test(ins.error.message || "")) {
    const slim = rows.map(({ meet_link, calendar_event_id, booking_group, ...r }) => r);
    ins = await admin.from("interviews").insert(slim).select();
  }
  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });

  // ---- Notify everyone on the call (in-app + branded email with the link) ----
  const whenText = `${dateText}, ${timeText}`;
  const meetLine = meet.meetLink ? `Join on Google Meet: ${meet.meetLink}` : "You'll receive the meeting link shortly.";

  // Candidate.
  await notifyUser(admin, {
    userId: me.id,
    email: me.email || me.authEmail,
    name: me.full_name,
    title: `${label} scheduled`,
    body: `Your ${label} for ${roleLabel} is booked for ${whenText}. We'll assign your interviewer and let you know.\n\n${meetLine}`,
    cta: meet.meetLink ? { label: "Join the call", url: meet.meetLink } : { label: "View your interviews", path: "/dashboard/interview" },
  });

  // Admins — a booking is waiting for an interviewer to be assigned.
  const candName = me.full_name || "A candidate";
  try {
    const { data: admins } = await admin.from("profiles").select("id, email, full_name").eq("role", "admin");
    for (const a of admins || []) {
      await notifyUser(admin, {
        userId: a.id, email: a.email, name: a.full_name,
        title: `Assign an interviewer — ${candName}`,
        body: `${candName} booked a ${label} for ${roleLabel} on ${whenText}. Please assign ${combined ? "the Professional and HR interviewers" : `the ${stages[0]} interviewer`}.`,
        cta: { label: "Assign interviewer", path: "/admin/interviews" },
      });
    }
  } catch { /* best-effort */ }

  return NextResponse.json({
    ok: true,
    meetLink: meet.meetLink,
    mock: !!meet.mock,
    combined,
    stages,
    dateText,
    timeText,
    startISO: start.toISOString(),
    endISO: end.toISOString(),
    invited: attendeeEmails,
    interviews: ins.data,
  });
}
