// NexIT Admin mock data.

export const STATS = [
  { label: "Total Candidates", value: "10,560", delta: "+8%" },
  { label: "Total Interviewers", value: "1,050", delta: "+3%" },
  { label: "Total Recruiters", value: "470", delta: "+5%" },
  { label: "CVs Received", value: "250", delta: "+2%" },
];

// applications over the last 12 weeks (line chart)
export const TREND = [12, 18, 15, 22, 20, 28, 26, 34, 30, 38, 35, 44];

export const ROLE_DIST = [
  { label: "Candidates", pct: 62, color: "#007bff" },
  { label: "Interviewers", pct: 22, color: "#2ecc71" },
  { label: "Recruiters", pct: 16, color: "#1c1f2a" },
];

export const STAGE_BARS = [
  { label: "AI", value: 70 },
  { label: "Prof.", value: 48 },
  { label: "HR", value: 36 },
  { label: "Board", value: 28 },
  { label: "Hired", value: 18 },
];

export const USER_GROUPS = [
  {
    group: "Pending approval",
    users: [
      { name: "Grace Okon", role: "Professional Interviewer", color: "#ffb27c" },
      { name: "Tunde Bello", role: "Recruiter", color: "#7c9cff" },
      { name: "Mary James", role: "HR Interviewer", color: "#8ad4a0" },
    ],
  },
  {
    group: "Active candidates",
    users: [
      { name: "Lawal Paul", role: "Full Stack Developer", color: "#c7a3ff" },
      { name: "Rose Adeyemi", role: "Product Designer", color: "#7cd4ce" },
      { name: "Musa Bello", role: "Backend Developer", color: "#ff9db1" },
      { name: "Ada Obi", role: "Frontend Developer", color: "#9db8ff" },
    ],
  },
  {
    group: "Partner recruiters",
    users: [
      { name: "TechCorp Inc", role: "Recruiter · 42 hires", color: "#7c9cff" },
      { name: "DataWise", role: "Recruiter · 18 hires", color: "#8ad4a0" },
    ],
  },
];

export const REQUESTS = [
  { id: "q1", name: "Grace Okon", type: "Interviewer application", role: "Professional", date: "Sep 26, 2026", status: "Pending" },
  { id: "q2", name: "Tunde Bello", type: "Recruiter application", role: "Recruiter", date: "Sep 25, 2026", status: "Pending" },
  { id: "q3", name: "Mary James", type: "Interviewer application", role: "HR", date: "Sep 25, 2026", status: "Pending" },
  { id: "q4", name: "Kola Ade", type: "Payout request", role: "Interviewer", date: "Sep 24, 2026", status: "Approved" },
  { id: "q5", name: "Zed Labs", type: "Recruiter application", role: "Recruiter", date: "Sep 23, 2026", status: "Declined" },
];

export const NOTIFICATIONS = [
  { id: "n1", title: "New interviewer application", body: "Grace Okon applied to be a Professional interviewer.", time: "Just now" },
  { id: "n2", title: "New recruiter application", body: "Tunde Bello applied to recruit on NexIT.", time: "1h ago" },
  { id: "n3", title: "Payout request", body: "Kola Ade requested a payout of $430.", time: "3h ago" },
  { id: "n4", title: "System backup completed", body: "Nightly backup finished successfully.", time: "Yesterday", ok: true },
];

export const SETTINGS_GROUPS = [
  {
    group: "General settings",
    items: [
      { label: "Allow new sign-ups", on: true },
      { label: "Require email verification", on: true },
    ],
  },
  {
    group: "Interview settings",
    items: [
      { label: "AI interview enabled", on: true },
      { label: "Auto-schedule reminders", on: true },
      { label: "Allow retake after 1 month", on: true },
    ],
  },
  {
    group: "Payments",
    items: [
      { label: "Interviewer payouts enabled", on: true },
      { label: "Training payments enabled", on: true },
      { label: "Manual payout approval", on: false },
    ],
  },
];
