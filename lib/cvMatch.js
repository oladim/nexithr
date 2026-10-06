/**
 * CV ↔ role skills match.
 *
 * This is a transparent, deterministic match of the candidate's DECLARED skills
 * against the required skillset an admin defined for the role. It is honest
 * about being a skills match (not a claim to have read the PDF).
 *
 * To upgrade to a true LLM read of the CV text later, keep this signature and
 * swap the body for a call to your model (extract PDF text → prompt → parse),
 * the same way lib/email.js swaps providers.
 */

// Defaults shown in demo mode (mirror the 0006 migration seed).
export const DEFAULT_REQS = [
  { role_key: "software", title: "Software Development", required_skills: ["JavaScript", "React", "Node", "TypeScript", "SQL", "REST APIs", "Git"], min_experience: 1 },
  { role_key: "data", title: "Data & Analytics", required_skills: ["Python", "SQL", "Pandas", "Statistics", "Data Visualization", "Machine Learning"], min_experience: 1 },
  { role_key: "product", title: "Product & Design", required_skills: ["Figma", "Prototyping", "User Research", "Design Systems", "Wireframing"], min_experience: 1 },
  { role_key: "cloud", title: "Cloud & DevOps", required_skills: ["AWS", "Docker", "Kubernetes", "CI/CD", "Terraform", "Linux"], min_experience: 2 },
  { role_key: "security", title: "Cybersecurity", required_skills: ["Network Security", "SIEM", "Penetration Testing", "Incident Response", "Firewalls"], min_experience: 2 },
  { role_key: "support", title: "IT Support", required_skills: ["Troubleshooting", "Windows", "Networking", "Active Directory", "Ticketing"], min_experience: 1 },
];
export const DEFAULT_REQS_BY_KEY = Object.fromEntries(DEFAULT_REQS.map((r) => [r.role_key, r]));

// Normalize a skill token: lowercase, drop punctuation/"js"/spaces so
// "Node js", "Node.js", "nodejs" all match "Node".
function norm(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[.\-_/]/g, " ")
    .replace(/\bjs\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Two skills match if one normalized token contains the other (handles
// "REST APIs" vs "REST", "TypeScript" vs "TypeScript").
function skillsEqual(a, b) {
  const x = norm(a);
  const y = norm(b);
  if (!x || !y) return false;
  return x === y || x.includes(y) || y.includes(x);
}

/**
 * @param {string[]} candidateSkills declared by the candidate
 * @param {object} roleReq { title, required_skills[], min_experience }
 * @param {object} [opts] { experienceYears }
 * @returns {{score, matched, missing, extra, verdict, comment, hasRole}}
 */
export function computeCvMatch(candidateSkills = [], roleReq, opts = {}) {
  if (!roleReq || !roleReq.required_skills?.length) {
    return {
      score: null,
      matched: [],
      missing: [],
      extra: candidateSkills,
      verdict: "No role profile",
      comment: "No skillset has been defined for this role yet. Add one under Role Requirements to enable automated matching.",
      hasRole: false,
    };
  }

  const required = roleReq.required_skills;
  const matched = required.filter((r) => candidateSkills.some((c) => skillsEqual(c, r)));
  const missing = required.filter((r) => !candidateSkills.some((c) => skillsEqual(c, r)));
  const extra = candidateSkills.filter((c) => !required.some((r) => skillsEqual(c, r)));
  const score = Math.round((matched.length / required.length) * 100);

  const verdict = score >= 70 ? "Strong match" : score >= 40 ? "Partial match" : "Weak match";

  const expNote =
    opts.experienceYears != null && roleReq.min_experience != null
      ? opts.experienceYears >= roleReq.min_experience
        ? ` Experience (${opts.experienceYears}y) meets the ${roleReq.min_experience}y minimum.`
        : ` Experience (${opts.experienceYears}y) is below the ${roleReq.min_experience}y minimum.`
      : "";

  const comment =
    `Automated skills match for ${roleReq.title}: the candidate lists ${matched.length} of ${required.length} required skills (${score}%). ` +
    (matched.length ? `Present: ${matched.join(", ")}. ` : "") +
    (missing.length ? `Missing: ${missing.join(", ")}. ` : "All required skills are present. ") +
    expNote +
    (score >= 70
      ? " Overall a good fit for the role."
      : score >= 40
      ? " A partial fit — consider asking the candidate to strengthen the missing areas or confirm them at interview."
      : " The CV doesn't strongly match this role — it may be worth asking the candidate to upload a CV that reflects the role, or to choose a better-fitting target role.");

  return { score, matched, missing, extra, verdict, comment, hasRole: true };
}

// A ready-to-send candidate note suggested from the match (used to pre-fill).
export function suggestedNote(match, roleTitle) {
  if (!match?.hasRole) return "";
  if (match.score >= 70) {
    return `Thanks for your submission. Your CV is a strong match for ${roleTitle} — we're moving you forward to the AI interview.`;
  }
  const missing = match.missing.slice(0, 5).join(", ");
  return (
    `Thanks for applying for ${roleTitle}. Reviewing your CV against the role, we couldn't find some of the key skills we look for` +
    (missing ? ` (${missing})` : "") +
    `. Please upload a CV that reflects this experience, or consider choosing a target role that better matches your background, then resubmit.`
  );
}
