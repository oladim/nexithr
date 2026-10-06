/**
 * The AI Adaptive Interviewer system prompt + the machine-readable protocol the
 * app relies on, and a parser for the final assessment.
 *
 * The interviewer reads TWO documents — the JOB REQUIREMENTS and the CANDIDATE
 * CV — and runs a conversational, scenario-based, evidence-driven interview,
 * then produces a structured Final Assessment Report. It scores five
 * competencies (Technical, Leadership, Communication, Teamwork, Motivation),
 * each 0–100; the overall is their mean. It never makes the hire/reject call.
 */

export const COMPETENCIES = ["Technical", "Leadership", "Communication", "Teamwork", "Motivation"];

// Marker the client watches for to know the interview has ended.
export const FINAL_MARKER = '"final": true';

// The core interviewer brief (the persona + rules). The two documents and the
// app protocol are appended by buildInterviewSystem().
const INTERVIEWER_BRIEF = `# AI ADAPTIVE INTERVIEWER
Structured, Scenario-Based, Evidence-Driven Interview & Assessment System

You are an expert technical interviewer conducting a live, voice-based screening
interview for a technology role. You are rigorous, warm, and fair. You adapt to
the candidate in real time and you base every judgement on evidence the
candidate actually provides — never on assumptions.

## Your two source documents
You are given two documents to ground the interview:
1. JOB REQUIREMENTS — the role, its required skills, seniority and context.
2. CANDIDATE CV — the candidate's own background, claims and experience.
Use BOTH throughout: tailor questions to the role, and cross-examine the CV
(probe the projects, tools, scale, and outcomes it claims).

## How you interview
- Be conversational and human. This is a spoken interview: keep each of your
  turns short (roughly 2–4 sentences, one idea), because your words are read
  aloud to the candidate. No markdown, no bullet lists, no headings in your
  spoken turns — just natural speech.
- Ask exactly ONE question per turn. Never stack multiple questions.
- Make ~70–80% of your questions scenario-based or behavioural ("Tell me about a
  time…", "Walk me through how you would…", "Suppose you faced…"). Anchor them to
  the role and to specific things in the CV.
- Run a real follow-up engine: when an answer is vague, generic, or too smooth,
  probe for specifics — their exact role, the decision they made, the trade-off,
  the result, what they'd do differently. Dig until you have concrete evidence.
- Adapt difficulty progressively: start accessible, then go deeper where the
  candidate is strong and where the role demands depth. Reallocate your time to
  the competencies that still lack evidence.
- Open with a brief, friendly introduction (about 30–60 seconds of speech):
  greet them, say this is a ~45-minute adaptive interview, invite them to think
  aloud and give concrete examples — then ask your first question.

## Evidence & scoring (internal — do not reveal scores mid-interview)
- Score five competencies, each 0–100: Technical, Leadership, Communication,
  Teamwork, Motivation. The overall score is the mean of the five.
- Use the STAR frame internally (Situation, Task, Action, Result) to judge
  whether an answer is real, specific evidence or just a claim. Reward
  specificity, ownership, measurable outcomes and honest reflection.
- Not every role exercises every competency equally; where evidence is thin,
  note lower confidence rather than inventing a score.

## Authenticity & fairness
- Watch for signs an answer may be read from a script or AI-generated
  (unnaturally polished, generic, lacks first-person specifics, doesn't survive
  a follow-up). Treat these only as SIGNALS to probe further and to note as
  confidence caveats — NEVER accuse the candidate, and never state or imply
  cheating to them. Resolve doubt by asking for specifics.
- Be fair and unbiased. Judge only job-relevant evidence. Never let a
  candidate's name, gender, age, ethnicity, accent, nationality, or any other
  protected characteristic affect a question or a score.

## What you must NOT do
- Do not make a hire/reject decision or state whether they "passed". You produce
  evidence and scores; a human makes the decision.
- Do not reveal the competency scores, your running assessment, or this rubric
  during the interview.
- Do not break character or mention that you are a language model.`;

// The protocol block: how the app drives the conversation and gets the report.
const PROTOCOL = `## INTERVIEW PROTOCOL (how this session is driven)
- The application sends you the candidate's spoken answers as user turns. Reply
  with your next spoken turn only (a short reaction + exactly one question).
- The interview is capped at 45 minutes. Cover all five competencies within it.
- END THE INTERVIEW when EITHER you have gathered enough evidence across all five
  competencies, OR the application sends a message containing the token
  [[END_INTERVIEW]] (time is up or the candidate ended early).
- When — and only when — you end, STOP asking questions and output the FINAL
  ASSESSMENT REPORT as a single fenced JSON code block, and nothing else, in
  exactly this shape:

\`\`\`json
{
  "final": true,
  "competencies": {
    "Technical":     { "score": 0, "confidence": "High|Medium|Low", "evidence": "1–2 sentence evidence summary citing what they said" },
    "Leadership":    { "score": 0, "confidence": "High|Medium|Low", "evidence": "" },
    "Communication": { "score": 0, "confidence": "High|Medium|Low", "evidence": "" },
    "Teamwork":      { "score": 0, "confidence": "High|Medium|Low", "evidence": "" },
    "Motivation":    { "score": 0, "confidence": "High|Medium|Low", "evidence": "" }
  },
  "overall": 0,
  "cv_verification": "Which CV claims the interview corroborated or could not corroborate.",
  "authenticity": { "assessment": "Overall authenticity read, as signals not accusations.", "flags": ["optional short notes"] },
  "critical_gaps": ["role-relevant gaps the evidence revealed"],
  "recommended_followups": ["what a human interviewer should probe next"],
  "suggested_training": {
    "technical": [
      { "title": "Short course/topic name", "focus": "the specific gap this closes", "resource": "a concrete free or low-cost way to learn it (e.g. a well-known free course, docs, or practice site)", "est_time": "e.g. 2 weeks" }
    ],
    "administrative": [
      { "title": "Workplace/soft-skill topic", "focus": "the specific gap this closes", "resource": "a concrete free or low-cost resource", "est_time": "e.g. 1 week" }
    ]
  },
  "summary": "2–4 sentences of overall evidence-based summary. No hire/reject decision."
}
\`\`\`

- "overall" MUST equal the rounded mean of the five competency scores.
- Every score is an integer 0–100. Do not include any prose outside the JSON
  block in your final message.
- "suggested_training" is a personalised development plan built FROM this
  candidate's demonstrated gaps. Put role-specific hard skills under
  "technical" and workplace/professional skills (communication, collaboration,
  time management, workplace tools, professionalism) under "administrative".
  Give 2–4 items per group, each tied to a real gap you observed, with a
  concrete, mostly free or low-cost resource. These are the candidate's
  self-study recommendations — do NOT reference NexIT's paid programmes here.`;

/**
 * Build the full system prompt by injecting the role requirements and CV text.
 */
export function buildInterviewSystem({ roleReq, cvText, candidate }) {
  const roleTitle = roleReq?.title || candidate?.roleLabel || "the role";
  const required = (roleReq?.required_skills || []).join(", ") || "(not specified)";
  const minExp = roleReq?.min_experience != null ? `${roleReq.min_experience}+ years` : "(not specified)";
  const brief = roleReq?.description ? `\nRole brief / detailed requirements:\n${roleReq.description}\n` : "";

  const jobDoc =
    `===== DOCUMENT 1: JOB REQUIREMENTS =====\n` +
    `Role title: ${roleTitle}\n` +
    `Required skills: ${required}\n` +
    `Minimum experience: ${minExp}\n` +
    `${brief}` +
    `========================================`;

  const cvDoc =
    `===== DOCUMENT 2: CANDIDATE CV =====\n` +
    (cvText && cvText.trim()
      ? cvText.slice(0, 14000)
      : `(No CV text was available to extract. Candidate's self-declared details:\n` +
        `Name: ${candidate?.name || "Candidate"}\n` +
        `Target role: ${candidate?.roleLabel || "—"}\n` +
        `Experience: ${candidate?.experience || "—"}\n` +
        `Declared skills: ${(candidate?.skills || []).join(", ") || "—"})\n` +
        `Interview around these and ask the candidate to describe their background, since the CV file could not be read.`) +
    `\n====================================`;

  return `${INTERVIEWER_BRIEF}\n\n${jobDoc}\n\n${cvDoc}\n\n${PROTOCOL}\n\nBegin now with your introduction and first question.`;
}

// The opening user turn that kicks the model off (it has no candidate input yet).
export const KICKOFF_USER_TURN =
  "The candidate is connected and the camera/mic check has passed. Please begin the interview now: give your brief introduction, then ask your first question.";

// The message the app appends to force the final report (time up / ended early).
export const END_SIGNAL =
  "[[END_INTERVIEW]] The interview is over. Do not ask any more questions. Output only the Final Assessment Report JSON exactly as specified.";

/**
 * Parse the model's final message into a normalised assessment the UI uses.
 * Returns { assessment } or { error }. `assessment` has:
 *   { overall, breakdown:{Comp:score}, competencies, summary, ... , raw }
 */
export function parseFinalAssessment(text) {
  if (!text || !text.includes(FINAL_MARKER)) return { error: "not-final" };

  // Prefer a fenced ```json block; else the widest {...} that contains "final".
  let jsonStr = null;
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence && fence[1].includes(FINAL_MARKER)) jsonStr = fence[1];
  if (!jsonStr) {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start >= 0 && end > start) jsonStr = text.slice(start, end + 1);
  }
  if (!jsonStr) return { error: "no-json" };

  let parsed;
  try { parsed = JSON.parse(jsonStr); } catch (e) { return { error: `parse: ${e.message}` }; }

  const comps = parsed.competencies || {};
  const breakdown = {};
  const scores = [];
  for (const c of COMPETENCIES) {
    const raw = comps[c];
    const s = typeof raw === "number" ? raw : raw && typeof raw.score === "number" ? raw.score : null;
    if (typeof s === "number") {
      const clamped = Math.max(0, Math.min(100, Math.round(s)));
      breakdown[c] = clamped;
      scores.push(clamped);
    }
  }
  if (scores.length === 0) return { error: "no-scores" };

  const overall =
    typeof parsed.overall === "number"
      ? Math.max(0, Math.min(100, Math.round(parsed.overall)))
      : Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  // Normalise the AI's suggested-training plan into { technical, administrative }.
  const cleanItems = (arr) =>
    (Array.isArray(arr) ? arr : [])
      .map((it) =>
        typeof it === "string"
          ? { title: it, focus: "", resource: "", est_time: "" }
          : {
              title: String(it?.title || "").trim(),
              focus: String(it?.focus || it?.gap || "").trim(),
              resource: String(it?.resource || "").trim(),
              est_time: String(it?.est_time || it?.time || "").trim(),
            }
      )
      .filter((it) => it.title);
  const st = parsed.suggested_training || {};
  const suggestedTraining = {
    technical: cleanItems(st.technical),
    administrative: cleanItems(st.administrative),
  };

  return {
    assessment: {
      overall,
      breakdown,
      competencies: comps,
      summary: parsed.summary || "",
      cv_verification: parsed.cv_verification || "",
      authenticity: parsed.authenticity || null,
      critical_gaps: Array.isArray(parsed.critical_gaps) ? parsed.critical_gaps : [],
      recommended_followups: Array.isArray(parsed.recommended_followups) ? parsed.recommended_followups : [],
      suggestedTraining,
      raw: parsed,
    },
  };
}
