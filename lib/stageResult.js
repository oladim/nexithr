// Server-side (authoritative) computation of a human-stage result. Mirrors the
// client demo logic in components/interview/stage.js, but lives server-side so
// a candidate can't choose their own pass/fail — the API computes the verdict
// and records it with the service role.

export const STAGE_PASS_AVG = 3.5;

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

export function synthesizeNotes(notes) {
  const list = (notes || []).filter(Boolean);
  if (list.length === 0) return null;
  const ratings = list.map((n) => Number(n.rating) || 0).filter((r) => r > 0);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
  const split = (v) => (Array.isArray(v) ? v : String(v || "")).toString().split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  const uniq = (arr) => { const seen = new Set(); const out = []; for (const x of arr) { const k = x.toLowerCase(); if (!seen.has(k)) { seen.add(k); out.push(x); } } return out; };
  const strengths = uniq(list.flatMap((n) => split(n.strengths))).slice(0, 6);
  const improvements = uniq(list.flatMap((n) => split(n.improvements))).slice(0, 6);
  const verdict = avg >= 4 ? "Recommended to advance" : avg >= 3 ? "Borderline" : "Not recommended";
  const summary =
    `Across ${list.length} interviewer${list.length > 1 ? "s" : ""}, the candidate scored an average of ${avg.toFixed(1)}/5. ` +
    (strengths.length ? `Consistent strengths: ${strengths.slice(0, 3).join(", ")}. ` : "") +
    (improvements.length ? `Common areas to improve: ${improvements.slice(0, 3).join(", ")}. ` : "") +
    (avg >= 4 ? "Overall the panel recommends advancing this candidate." : avg >= 3 ? "The panel is split — a further review may help." : "The panel does not recommend advancing at this stage.");
  return { verdict, avg: Number(avg.toFixed(1)), strengths, improvements, summary, count: list.length };
}

export function computeStageResult(kind, attemptNo) {
  const synth = synthesizeNotes(panelNotes(kind, attemptNo));
  return { ...synth, passed: synth.avg >= STAGE_PASS_AVG };
}
