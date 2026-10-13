# NexIT-Africa role catalog — authoring spec

NexIT-Africa (Nigeria-based) assesses tech candidates: CV review → voice AI interview →
Professional (technical) interview → HR interview → verified candidate board (N|VP
certificate). It also sells role-specific training (Foundational + Intensive courses).

Each AREA file is `content/roles/<areaKey>.js` and must `export default` ONE plain object
(no imports, no functions, no comments needed beyond a header line). Valid ES module.
Use straight ASCII quotes in code; content strings may use ’ — – etc. Escape backticks.

## Shape

```js
export default {
  key: "support",                 // area key (given)
  title: "IT Support",            // area title (given)
  summary: "1–2 sentences on the area.",
  roles: [ /* exactly 4 roles, in the order given */ {
    id: "helpdesk",               // slug given to you, lowercase a-z only
    title: "IT Help Desk Technician",
    summary: "2 sentences: what the role does and where it sits in a team.",
    competencies: [               // exactly 5 role-specific TECHNICAL sub-competencies; weights sum to 100
      { name: "Troubleshooting method", weight: 25, description: "one sentence" }
    ],
    levels: {                     // exactly these three keys
      junior: LEVEL, mid: LEVEL, senior: LEVEL
    },
    hrScenarios: [                // exactly 3 role-specific situational/behavioural questions for the HR round
      { q: "question text", lookFor: "what a strong answer shows (1 sentence)" }
    ],
    curriculum: {
      foundational: COURSE,       // aimed at junior / career-switchers
      intensive: COURSE           // job-ready depth; last module is the level-aware capstone
    }
  } ]
};
```

### LEVEL
```js
{
  minYears: 0,                    // junior 0, mid 2, senior 5 (adjust ±1 only if the role truly demands)
  focus: "one sentence: what this level is trusted to do",
  responsibilities: [5 strings],  // concrete, level-appropriate (senior = owns/leads/designs/mentors)
  skills: [7 strings],            // short skill names (2–4 words), used to match CVs — be specific
  tools: [6 strings],             // real, widely used tools/platforms for this role
  certifications: [2-3 strings],  // real, current certifications appropriate to the level (exact official names)
  aiTopics: [5 strings],          // technical areas the AI interviewer must probe at this level
  aiScenarios: [3 strings],       // scenario prompts the AI can adapt ("A user reports… walk me through…")
  aiExpectations: "2 sentences: what a 'ready' candidate at this level demonstrates vs. what's a red flag.",
  proQuestions: [                 // exactly 5 for the human Professional interviewer
    { q: "question", lookFor: "what a strong answer includes (1–2 sentences)" }
  ]
}
```

### COURSE
```js
{
  title: "IT Support Foundations",
  summary: "1–2 sentences",
  duration: "4 weeks",            // foundational 3–5 weeks, intensive 6–10 weeks
  modules: [                      // foundational: 4 text + 1 quiz + 1 assignment (6 total)
                                  // intensive: 4 text + 1 assignment + 1 quiz + 1 capstone assignment (7 total)
    { type: "text", title: "…", content: "LESSON: 120–200 words, real teaching content: key concepts, a short worked example or checklist. Plain text with line breaks (\\n) allowed. No markdown headings." },
    { type: "quiz", title: "…", questions: [ { q: "…", options: ["A","B","C","D"], answer: 0 } ] },   // exactly 6 questions, 4 options each, answer = index 0–3, vary the correct index, one unambiguously correct option
    { type: "assignment", title: "…", maxScore: 100, content: "Brief + deliverables + how it's graded (80–150 words)." },
    // intensive only, LAST module:
    { type: "assignment", title: "Capstone: …", maxScore: 100,
      content: "Shared brief, then three labelled variants on separate lines:\nJunior: …\nMid: …\nSenior: …\nDeliverables: …\nGrading: …" }
  ]
}
```

## Quality bar
- Accurate, current (2025–26) industry practice. Real tool and certification names only.
- Practical, hiring-manager realistic. Level differences must be meaningful, not copy-paste.
- Light African/Nigerian context where natural (e.g. NDPA 2023 for data protection, power/
  connectivity constraints, mobile-money integrations, local banks/telcos as example
  employers) — never forced, never invented statistics or fake company claims.
- No fabricated people, quotes, salaries or statistics.
- Questions must be answerable by evidence (STAR-friendly), not trivia.
- Quiz questions test understanding, have exactly one correct option, plausible distractors.
