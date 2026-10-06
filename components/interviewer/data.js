// Mock data for the interviewer portal (Professional / HR).
// Swap for API data. The AI-synthesis helper is a deterministic stand-in for
// the real model that would merge all interviewers' notes into final feedback.

export const STATS = [
  { label: "Interviews Conducted", value: "15" },
  { label: "Interviews Scheduled", value: "06" },
  { label: "Total Payment Earned", value: "$750" },
  { label: "Upcoming Interviews", value: "5" },
  { label: "Average Feedback Score", value: "4.2" },
];

// Interviews conducted over the last months (bar chart).
export const CONDUCTED = [4, 7, 5, 9, 6, 11, 8];
export const MONTHS = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

// Feedback outcome distribution (donut).
export const OUTCOMES = [
  { label: "Recommended", pct: 55, color: "#2ecc71" },
  { label: "Borderline", pct: 30, color: "#007bff" },
  { label: "Not recommended", pct: 15, color: "#1c1f2a" },
];

// Candidates this interviewer has interviewed. `notes` are from OTHER
// interviewers already on file — the current interviewer adds their own.
export const CANDIDATES = [
  {
    id: "john-wale",
    name: "John Wale",
    role: "Full Stack Developer",
    date: "Aug 1, 2025",
    status: "Awaiting your feedback",
    color: "#7c9cff",
    notes: [
      { interviewer: "Rose Mary", kind: "Professional", rating: 4, strengths: "Strong communication, solid React", improvements: "Deeper system design", note: "Presented well and reasoned through the frontend task cleanly." },
      { interviewer: "Dodo Toya", kind: "Professional", rating: 4, strengths: "Good problem solving", improvements: "Leadership examples", note: "Handled the API design question with good trade-off awareness." },
    ],
  },
  {
    id: "rose-adeyemi",
    name: "Rose Adeyemi",
    role: "Product Designer",
    date: "Aug 3, 2025",
    status: "Awaiting your feedback",
    color: "#ffb27c",
    notes: [
      { interviewer: "Ken Obi", kind: "Professional", rating: 5, strengths: "Excellent portfolio, clear rationale", improvements: "Handoff detail", note: "Very strong design thinking and user empathy." },
    ],
  },
  {
    id: "musa-bello",
    name: "Musa Bello",
    role: "Backend Developer",
    date: "Aug 5, 2025",
    status: "Reviewed",
    color: "#8ad4a0",
    notes: [
      { interviewer: "Rose Mary", kind: "Professional", rating: 3, strengths: "Good DB knowledge", improvements: "Testing habits, clarity", note: "Solid fundamentals but explanations were a bit unclear." },
    ],
  },
];

export const REQUESTS = [
  { id: "r1", name: "John Wale", role: "Full Stack Developer", date: "Aug 12, 2025", fee: 50 },
  { id: "r2", name: "Ada Obi", role: "Frontend Developer", date: "Aug 13, 2025", fee: 50 },
  { id: "r3", name: "Kate Morrison", role: "Product Manager", date: "Aug 14, 2025", fee: 50 },
  { id: "r4", name: "Lori Bryson", role: "Data Analyst", date: "Aug 15, 2025", fee: 50 },
];

export const PAYMENTS = [
  { candidate: "Rose Mary", date: "05/07/2025", position: "Full Stack Dev", status: "Pending", amount: "$50" },
  { candidate: "John Wale", date: "03/07/2025", position: "Product Designer", status: "Paid", amount: "$70" },
  { candidate: "Musa Bello", date: "01/07/2025", position: "Backend Dev", status: "Paid", amount: "$50" },
];

export const ACTIVITIES = [
  { type: "Withdrawal", ok: true, amount: "$4300" },
  { type: "Payment received", ok: true, amount: "$300" },
  { type: "Withdrawal", ok: true, amount: "$400" },
  { type: "Withdrawal", ok: true, amount: "$1300" },
];

export const TRANSACTIONS = [
  { name: "John Wale", type: "E-Transfer", status: "Pending", date: "Jan 2, 2026", amount: "$300" },
  { name: "Rose Mary", type: "E-Transfer", status: "Done", date: "Dec 7, 2025", amount: "$70" },
  { name: "John Mark", type: "E-Transfer", status: "Done", date: "Jan 2, 2026", amount: "$300" },
  { name: "Dodo Toya", type: "E-Transfer", status: "Done", date: "Dec 9, 2025", amount: "$60" },
];

export const NOTIFICATIONS = [
  { id: "n1", title: "Interview Request", body: "An interview with Rose Mary has been scheduled for 10AM.", time: "Just now" },
  { id: "n2", title: "Interview Request", body: "An interview with John Mark has been scheduled for 10AM.", time: "11:16 AM" },
  { id: "n3", title: "Interview Request", body: "An interview with John Mark has been scheduled for 10AM.", time: "09:00 AM" },
  { id: "n4", title: "Interview Request", body: "An interview with John Mark has been scheduled for 10AM.", time: "Yesterday" },
  { id: "n5", title: "Password Update successfully", body: "Your password was updated successfully.", time: "Yesterday", ok: true },
];

/**
 * Deterministic stand-in for the AI that merges all interviewers' notes into
 * a single final feedback shown to the candidate. Replace with a real model
 * call; the shape (verdict / avg / strengths / improvements / summary) is what
 * the candidate-facing view would render.
 */
export function synthesizeNotes(notes) {
  const list = notes.filter(Boolean);
  if (list.length === 0) return null;

  const ratings = list.map((n) => Number(n.rating) || 0).filter((r) => r > 0);
  const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

  const split = (v) =>
    (Array.isArray(v) ? v : String(v || ""))
      .toString()
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const uniq = (arr) => {
    const seen = new Set();
    const out = [];
    for (const x of arr) {
      const k = x.toLowerCase();
      if (!seen.has(k)) { seen.add(k); out.push(x); }
    }
    return out;
  };

  const strengths = uniq(list.flatMap((n) => split(n.strengths))).slice(0, 6);
  const improvements = uniq(list.flatMap((n) => split(n.improvements))).slice(0, 6);

  const verdict =
    avg >= 4 ? "Recommended to advance" : avg >= 3 ? "Borderline" : "Not recommended";

  const summary =
    `Across ${list.length} interviewer${list.length > 1 ? "s" : ""}, the candidate scored an average of ${avg.toFixed(1)}/5. ` +
    (strengths.length ? `Consistent strengths: ${strengths.slice(0, 3).join(", ")}. ` : "") +
    (improvements.length ? `Common areas to improve: ${improvements.slice(0, 3).join(", ")}. ` : "") +
    (avg >= 4
      ? "Overall the panel recommends advancing this candidate."
      : avg >= 3
      ? "The panel is split — a further review may help."
      : "The panel does not recommend advancing at this stage.");

  return { verdict, avg: Number(avg.toFixed(1)), strengths, improvements, summary, count: list.length };
}
