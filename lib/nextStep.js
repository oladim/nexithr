/**
 * Where a candidate is in the pipeline and what they should do next.
 * Pure function — used by the dashboard "Next step" card (client), the admin
 * Remind button and the automatic nudges (server), so all three always agree.
 *
 * Input (either the client `app` state or a server-built equivalent):
 *   { roleKey, roleTitle, cv: { status, reviewNote } | null,
 *     ai: { attempts, passed, status },
 *     stages: { Professional: { attempts, passed }, HR: { attempts, passed } },
 *     interviews: [{ type, status, date, time }], onBoard }
 *
 * Output: { key, step, of, title, body, cta: { label, path }, actionable }
 *   key         stable id of the step (reminders count per key)
 *   step / of   progress (1-based) for a "Step 3 of 6" label
 *   actionable  false when the candidate is waiting on NexIT, not the other
 *               way round — no automatic nudges then.
 */
export const STEP_KEYS = [
  "role", "cv-upload", "cv-review", "cv-changes", "cv-rejected", "cv-level",
  "ai-take", "ai-review", "ai-retake",
  "pro-book", "pro-upcoming", "pro-result", "pro-retry",
  "hr-book", "hr-upcoming", "hr-result", "hr-retry",
  "done",
];
export const STAGE_OF = {
  role: 1, "cv-upload": 1, "cv-review": 1, "cv-changes": 1, "cv-rejected": 1, "cv-level": 1,
  "ai-take": 2, "ai-review": 2, "ai-retake": 2,
  "pro-book": 3, "pro-upcoming": 3, "pro-result": 3, "pro-retry": 3,
  "hr-book": 4, "hr-upcoming": 4, "hr-result": 4, "hr-retry": 4,
  done: 5,
};
export const STAGE_LABELS = ["CV", "AI interview", "Professional interview", "HR interview", "Certified"];

const when = (iv) => [iv?.date, iv?.time].filter(Boolean).join(" at ");

export function nextStep(s = {}) {
  const role = s.roleTitle || "your role";
  const cv = s.cv || null;
  const ai = s.ai || {};
  const st = s.stages || {};
  const ivs = s.interviews || [];
  const mk = (key, title, body, cta, actionable = true) => ({ key, step: STAGE_OF[key], of: 5, title, body, cta, actionable });

  if (!s.roleKey) return mk("role", "Choose the role you're applying for",
    "Pick your area, role and level so we can assess you against the right requirements.",
    { label: "Choose a role", path: "/dashboard/profile" });

  // 1) CV
  if (!cv) return mk("cv-upload", "Upload your CV",
    `Upload your CV for ${role} (PDF or Word .docx, up to 5 MB). Our team reviews it, then your AI interview unlocks.`,
    { label: "Upload CV", path: "/dashboard/cv-upload" });
  switch (cv.status) {
    case "Level suggested": return mk("cv-level", "Respond to your level suggestion",
      "Our reviewers suggest a different level based on your CV. Accept it to unlock your AI interview straight away, or keep your level for another review.",
      { label: "See the suggestion", path: "/dashboard/cv-upload" });
    case "Changes requested": return mk("cv-changes", "Update your CV",
      `Our reviewers asked for changes before approving your CV for ${role}.${cv.reviewNote ? ` Their note: “${cv.reviewNote}”` : ""} Upload the updated CV to continue.`,
      { label: "Upload updated CV", path: "/dashboard/cv-upload" });
    case "Rejected": return mk("cv-rejected", "Choose your next move",
      `Your CV wasn't approved for ${role}.${cv.reviewNote ? ` Reviewer's note: “${cv.reviewNote}”` : ""} You can upload a stronger CV, or pick a level or role that fits your background better.`,
      { label: "Review your options", path: "/dashboard/cv-upload" });
    case "Approved": break;
    default: return mk("cv-review", "We're reviewing your CV",
      `Your CV for ${role} is with our reviewers. We'll notify you as soon as there's a decision — usually within a few working days.`,
      { label: "View your CV", path: "/dashboard/cv-upload" }, false);
  }

  // 2) AI interview
  if (!ai.passed) {
    if (!(ai.attempts > 0)) return mk("ai-take", "Take your AI interview",
      `Your CV is approved. The AI interview is a 20–30 minute conversation about your experience for ${role}. Find a quiet spot with a working microphone.`,
      { label: "Start the AI interview", path: "/dashboard/interview/ai" });
    if (ai.status && ai.status !== "released") return mk("ai-review", "Your AI interview is being reviewed",
      "Thanks for completing your AI interview. Our team is confirming the result — we'll notify you when it's released.",
      { label: "View status", path: "/dashboard/interview/ai" }, false);
    return mk("ai-retake", "Prepare for your AI interview retake",
      "You didn't reach the pass mark this time. Review your feedback and the suggested training, then retake the AI interview when you're ready.",
      { label: "See feedback & retake", path: "/dashboard/interview/ai" });
  }

  // 3) Professional, 4) HR
  for (const [stage, pre, path, label] of [["Professional", "pro", "/dashboard/interview/professional", "Professional"], ["HR", "hr", "/dashboard/interview/hr", "HR"]]) {
    const res = st[stage] || {};
    if (res.passed) continue;
    const mine = ivs.filter((i) => i.type === stage);
    const upcoming = mine.find((i) => i.status === "Confirmed");
    if (upcoming) return mk(`${pre}-upcoming`, `Attend your ${label} interview`,
      `Your ${label} interview is booked${when(upcoming) ? ` for ${when(upcoming)}` : ""}. Join on time from a quiet place with a stable connection${upcoming.meetLink ? " using the meeting link" : ""}.`,
      { label: "View booking", path }, true);
    const completed = mine.some((i) => i.status === "Completed");
    if (res.attempts > 0) return mk(`${pre}-retry`, `Rebook your ${label} interview`,
      `You didn't pass the ${label} interview this time. Read your interviewer's feedback, prepare, and book another session.`,
      { label: "See feedback & rebook", path });
    if (completed) return mk(`${pre}-result`, `Waiting for your ${label} interview result`,
      `Your ${label} interview is done. Your interviewer is writing up the result — we'll notify you when it's ready.`,
      { label: "View status", path }, false);
    return mk(`${pre}-book`, `Book your ${label} interview`,
      stage === "Professional"
        ? `You passed the AI interview — well done! Next, book a live interview with a ${role} professional.`
        : "You passed the Professional interview. The last step is a short HR interview about how you work with others.",
      { label: `Book ${label} interview`, path });
  }

  return mk("done", "You're a NexIT Verified Professional",
    `You've passed every stage for ${role}. Download your certificate and keep an eye on Jobs — hiring partners can now find you.`,
    { label: "View certificate", path: "/dashboard/certificate" }, false);
}
