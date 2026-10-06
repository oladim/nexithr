// Recruiter portal mock data. The candidate board = successful candidates who
// passed AI + Professional + HR and can be reached directly by recruiters.

export const STATS = [
  { label: "Data Candidate", value: "1000+" },
  { label: "Total Jobs Available", value: "8" },
  { label: "Total Recruited", value: "1000+" },
];

export const JOB_ROLES = ["All roles", "Frontend Developer", "Backend Developer", "Product Designer", "Product Manager", "Data Analyst"];
export const LEVELS = ["All levels", "Junior", "Mid", "Senior", "Lead"];
export const LOCATIONS = ["All locations", "Lagos", "Abuja", "Nairobi", "Accra", "Remote"];

export const CANDIDATES = [
  { id: "c1", name: "Lawal Paul Tomisin", role: "Full Stack Developer", exp: "5yrs", level: "Senior", location: "Lagos", skills: ["React", "Node", "AWS"], rating: 5, status: "Interviewed", color: "#7c9cff" },
  { id: "c2", name: "Rose Adeyemi", role: "Product Designer", exp: "4yrs", level: "Mid", location: "Abuja", skills: ["Figma", "Research", "UI"], rating: 5, status: "Interviewed", color: "#ffb27c" },
  { id: "c3", name: "Musa Bello", role: "Backend Developer", exp: "3yrs", level: "Mid", location: "Remote", skills: ["Python", "Django", "SQL"], rating: 4, status: "Interviewed", color: "#8ad4a0" },
  { id: "c4", name: "Ada Obi", role: "Frontend Developer", exp: "2yrs", level: "Junior", location: "Lagos", skills: ["React", "CSS", "TS"], rating: 4, status: "Interviewed", color: "#c7a3ff" },
  { id: "c5", name: "Kate Morrison", role: "Product Manager", exp: "6yrs", level: "Senior", location: "Nairobi", skills: ["Strategy", "Agile", "Roadmap"], rating: 5, status: "Interviewed", color: "#7cd4ce" },
  { id: "c6", name: "John Wale", role: "Data Analyst", exp: "3yrs", level: "Mid", location: "Accra", skills: ["SQL", "Python", "BI"], rating: 4, status: "Interviewed", color: "#ff9db1" },
];

export const REVIEW = [
  { name: "Lawal Paul", niche: "Frontend", position: "Full Stack Dev", time: "2 hrs ago", status: "Recommended" },
  { name: "Rose Adeyemi", niche: "Design", position: "Product Designer", time: "3 hrs ago", status: "Recommended" },
  { name: "Musa Bello", niche: "Backend", position: "Backend Dev", time: "5 hrs ago", status: "Shortlisted" },
  { name: "Ada Obi", niche: "Frontend", position: "Frontend Dev", time: "1 day ago", status: "Shortlisted" },
];
