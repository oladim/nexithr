import { synthesizeNotes } from "@/components/interviewer/data";

/**
 * Metadata + mock result synthesis for the human interview stages
 * (Professional and HR). Mirrors the interviewer-portal model: a panel of
 * human interviewers leaves notes, and the AI synthesises them into the final
 * feedback the candidate sees (see synthesizeNotes).
 *
 * Front-end only: the first attempt is scored below the bar so the token-based
 * retry flow is visible in a demo; a retry then passes.
 */

export const STAGE_META = {
  Professional: {
    label: "Professional Interview",
    short: "Professional",
    blurb:
      "A panel of human experts in your field assesses your technical depth and problem-solving.",
    interviewer: "Paul Tomisin",
    panel: ["Paul Tomisin", "Aisha Bello", "David Okon"],
    next: "HR",
  },
  HR: {
    label: "HR Interview",
    short: "HR",
    blurb:
      "A final conversation with our HR team on communication, culture fit and role expectations.",
    interviewer: "Grace Umeh",
    panel: ["Grace Umeh", "Tunde Adeyemi"],
    next: null, // last stage → candidate board
  },
};

// Pass bar for a human stage (average panel rating out of 5).
export const STAGE_PASS_AVG = 3.5;

// Mock panel notes. Attempt 1 is a near-miss; retries land a clear pass.
function panelNotes(kind, attemptNo) {
  const weak = attemptNo <= 1;

  if (kind === "Professional") {
    return weak
      ? [
          { rating: 3, strengths: "Solid fundamentals, Clear communication", improvements: "System design depth, Edge-case handling" },
          { rating: 2, strengths: "Good attitude", improvements: "Data-structure choices, Time complexity reasoning" },
          { rating: 3, strengths: "Practical experience", improvements: "Testing strategy" },
        ]
      : [
          { rating: 4, strengths: "Strong system design, Clear trade-off reasoning", improvements: "Occasional over-engineering" },
          { rating: 5, strengths: "Excellent problem decomposition, Clean code", improvements: "" },
          { rating: 4, strengths: "Confident, well-structured answers", improvements: "Deeper testing detail" },
        ];
  }

  // HR
  return weak
    ? [
        { rating: 3, strengths: "Friendly, Coachable", improvements: "Concrete examples, Salary alignment" },
        { rating: 3, strengths: "Motivated", improvements: "Clarity on notice period, Role expectations" },
      ]
    : [
        { rating: 4, strengths: "Great communication, Strong culture fit", improvements: "" },
        { rating: 5, strengths: "Clear on expectations, Aligned on compensation", improvements: "" },
      ];
}

/**
 * Returns the AI-synthesised result for a stage attempt:
 * { verdict, avg, strengths[], improvements[], summary, count, passed }
 */
export function computeStageResult(kind, attemptNo) {
  const synth = synthesizeNotes(panelNotes(kind, attemptNo));
  return { ...synth, passed: synth.avg >= STAGE_PASS_AVG };
}
