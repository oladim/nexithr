// Shared interview material used by every role (HR round + scoring anchors).
// Merged with each role's playbook at runtime; also read by scripts/build-roles.mjs.
export default {
  levels: {
    junior: { label: "Junior", years: "0–2 years", blurb: "Learning the craft; does well-defined work with guidance." },
    mid: { label: "Mid-level", years: "2–5 years", blurb: "Works independently; owns features, services or processes end to end." },
    senior: { label: "Senior", years: "5+ years", blurb: "Leads, designs and mentors; accountable for outcomes across a team." },
  },

  // 1–5 anchors interviewers use for every competency they score.
  ratingAnchors: [
    { score: 1, label: "No evidence", meaning: "Could not give a real example, or the answer was wrong or unsafe." },
    { score: 2, label: "Limited", meaning: "Some knowledge but vague, theoretical or heavily prompted; below the level applied for." },
    { score: 3, label: "Meets bar", meaning: "Specific, correct example at the expected level with a clear personal contribution." },
    { score: 4, label: "Strong", meaning: "Specific, measurable results; explains trade-offs and what they would do differently." },
    { score: 5, label: "Exceptional", meaning: "Above the level applied for; teaches the interviewer something; sound judgement under ambiguity." },
  ],

  // Professional round: how to run it and decide.
  professionalNotes: [
    "Spend about 45 minutes. Use the level questions below and follow up until you have specifics (what they did, how, the result).",
    "Score each technical competency 1–5 using the anchors, then give an overall rating and a clear advance / do-not-advance decision.",
    "Recommend advancing at 4+ overall for the level applied for; 3 is borderline — explain what evidence was missing.",
    "Judge only job-relevant evidence. Accent, age, gender, school, religion or tribe must never affect a score.",
  ],

  // HR round: common questions for every role.
  hrCommon: [
    { q: "Walk me through your career so far and why you’re applying for this role now.", lookFor: "A coherent story, realistic reasons and a clear link between past work and this role." },
    { q: "Tell me about a time you disagreed with a manager or teammate. What happened?", lookFor: "Respectful challenge, listens, uses evidence, reaches an outcome and keeps the relationship." },
    { q: "Describe a mistake you made at work and what you changed afterwards.", lookFor: "Owns it without blaming others, explains the fix and the lasting change in behaviour." },
    { q: "How do you plan your week when everything feels urgent?", lookFor: "A real prioritisation method, communicates trade-offs early, protects deadlines." },
    { q: "Tell me about a time you worked with someone very different from you.", lookFor: "Curiosity, adapts communication style, focuses on the shared goal; no stereotyping." },
    { q: "What does a good working environment look like for you, and what would make you leave?", lookFor: "Self-awareness, realistic expectations, values aligned with professional conduct." },
    { q: "How do you keep your skills current?", lookFor: "Concrete recent learning (courses, projects, communities) and applying it at work." },
    { q: "Are there any constraints we should know about — notice period, location, working hours or connectivity?", lookFor: "Honest, practical answers; plans for power/internet backup if remote." },
  ],
  hrNotes: [
    "Confirm identity matches the CV and certificate records before starting.",
    "Assess professionalism, communication, integrity, teamwork and motivation — not technical depth (the Professional round covered that).",
    "Never ask about marital status, pregnancy, religion, tribe, age or health. Stick to the job.",
    "Recommend advancing at 4+ overall. Passing HR places the candidate on the verified board and issues their N|VP certificate.",
  ],
  hrCompetencies: [
    { name: "Professionalism & integrity", description: "Honest, reliable, respectful; consistent with the CV." },
    { name: "Communication", description: "Clear, structured and adapted to the listener." },
    { name: "Teamwork", description: "Collaborates, handles conflict well, supports others." },
    { name: "Ownership", description: "Takes responsibility for outcomes and mistakes." },
    { name: "Motivation & fit", description: "Genuine interest in the role; realistic expectations." },
  ],
};
