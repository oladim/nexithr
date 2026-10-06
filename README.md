# NexIT-Africa — Next.js

Next.js (App Router) build of the NexIT-Africa platform — a four-portal tech
recruitment product (candidate, interviewer, recruiter, admin) with the full
AI → Professional → HR → candidate-board interview journey. Components live
under `components/`, styled with plain CSS in `app/globals.css` (Poppins/Inter,
the blue→navy gradient system).

## Backend / database (Supabase)

The app runs front-end-only out of the box (demo mode, browser storage). To
turn on the **real database + authentication** (Postgres, Supabase Auth, file
storage, Row-Level Security), follow **[SETUP.md](./SETUP.md)** — create a free
Supabase project, run `supabase/migrations/*.sql`, add three keys to
`.env.local`, and optionally `node scripts/seed-demo.mjs`. The app switches to
real mode automatically once the keys are present. Data access lives in
`lib/db.js`; auth/session wiring in `lib/supabase/` and `middleware.js`.

## Getting started

```bash
npm install
npm run fetch-assets   # downloads the real photos into public/images (see below)
npm run dev
```

Open http://localhost:3000.

## About `npm run fetch-assets`

The photographic assets (avatars, the "About" section photos, the CTA and
process-card background art) were exported from Figma as temporary,
short-lived URLs — Figma serves each export link for a limited window
(roughly a week) after it's generated, then it 404s.

`scripts/fetch-assets.mjs` downloads those into `public/images/`. Run it
once, soon, before the links expire. If a link has already expired by the
time you run it, the script tells you which file failed — re-export that
layer from the Figma file (right-click → Copy/Export as PNG) and drop it
into `public/images/` under the same filename; the components already
reference the right local paths, nothing else needs to change.

Everything that ISN'T a photo (icons, the logo, decorative blobs, the
star/plus/social icons) is hand-authored inline SVG or CSS in this build —
no external or emoji dependency, so those never go missing regardless of
the visitor's OS/browser.

## Structure

```
app/
  layout.js       — fonts (next/font/google), <html>/<body>, metadata
  page.js         — assembles all sections
  globals.css     — all styling
  providers.js    — client wrapper mounting <AuthProvider>
  login/          — /login          (exact Figma)
  signup/         — /signup         (5-step wizard; step 1 exact Figma)
  forgot-password/— /forgot-password (3 internal steps)
  reset-password/ — /reset-password  (2 internal steps)
  verify-email/   — /verify-email    (post-signup code entry)
  congratulations/— /congratulations (success → dashboard)
  dashboard/                          (protected app — sidebar shell)
    layout.js     — sidebar + topbar shell, mobile drawer, route guard
    page.js       — /dashboard          home (banner, stats, charts, calendar, jobs)
    cv-upload/    — /dashboard/cv-upload upload form + uploaded-CV view
    interview/    — /dashboard/interview self-scheduling (AI/Professional/HR)
    training/, profile/, settings/    — sidebar stubs
components/
  Header, Hero, LogosStrip, About, Process, Faq, CtaBanner, Testimonials, Footer
  Icons.js        — every inline SVG icon used across the site
  auth/           — AuthLayout, AuthAside, Field (TextField/SelectField), OAuthButtons
  context/AuthContext.js — mock store: signup + session + CV + interviews
scripts/
  fetch-assets.mjs
public/images/    — populated by fetch-assets (empty until you run it)
```

## Candidate dashboard (navigation + state)

Everything under `/dashboard/*` shares one shell (`app/dashboard/layout.js`)
— a persistent left sidebar (Dashboard, CV Upload, Interview, Training,
Profile, Settings, Logout) and a top bar. On desktop the sidebar is fixed;
below ~1000px it collapses into a hamburger drawer, and cards stack. The
shell is route-guarded: no session → redirect to `/login`.

- **Dashboard home** — CV-status banner (with an "Upload New CV" action),
  stat cards, a Skill Master Radar donut and Cumulative Score bars (both
  hand-built with CSS/SVG, no charting library), a month calendar, job
  opportunities, and a "Schedule an interview" CTA. Charts show placeholder
  data — feed them real numbers when the backend exists.
- **CV Upload** (`/dashboard/cv-upload`) — this is the "didn't upload at
  registration" path. Shows the 3-step upload form (file → key details →
  job-role prefs) when no CV is on file, and an uploaded-CV view with
  Edit/Download once one is. Submitting stores the CV in app state, which
  flips the dashboard banner to "uploaded".
- **Interview scheduling** (`/dashboard/interview`) — the candidate books
  their **own** AI, Professional, and HR interviews: pick the interview
  type (+ virtual/in-person), pick an available time slot, review, confirm.
  Confirmed interviews are saved to state and listed below with a cancel
  action. The confirmation card mirrors the Figma "Interview Confirmed"
  screen (Role, Date & Time, Mode, Interviewer, Add to Calendar). Each
  scheduled AI interview has a **Start** button → the AI interview session.
- **AI interview** (`/dashboard/interview/ai`) — a **proctored, full-screen
  voice interview**:
  - **Consent gate first** — a privacy/proctoring notice (video+audio
    recording, AI integrity monitoring, voice-only answers, data use) with a
    live camera device-check, and a required consent checkbox. Start is
    disabled until consented.
  - **Locked kiosk session** — once started it renders a fixed full-viewport
    overlay (and requests real fullscreen), so the sidebar and the rest of
    the app are unreachable until the interview ends. The AI asks each
    question aloud (`speechSynthesis`) with a speaking animation; the
    candidate answers by voice via a record button (waveform + timer); the
    live webcam self-view (`getUserMedia`) shows a "Monitoring active · face
    detected" proctor chip; a REC dot, question counter and session timer sit
    up top.
  - **Cancel counts as an attempt** — "End interview" opens a confirm dialog;
    confirming records an attempt against the retry limit and shows a
    cancelled result.
  - **Scored result** — on completion, an 82%/88% score (attempt 1 fails,
    a retake passes — both sides of the 85% rule), Correctness/Clarity/
    Skills/Relevance breakdown, and feedback. Pass → continue to the
    professional interview; fail → retake or unlock training ($29 payment).

  What's **real** in the browser: the webcam preview/self-view, the spoken
  questions, fullscreen, and the recording UI/timers. What's **stubbed** for
  the backend: speech-to-text of answers, the actual score/feedback, and the
  AI cheat-detection (the proctor chip is indicative only). `computeResult()`
  and the media hooks are the seams to wire up.
- **Training** (`/dashboard/training`) — a tabbed section (Overview /
  Specific Training / Suggested Training):
  - **Overview** — the training dashboard: progress overview with day dots
    and a "Start Task", a training-progress donut (Completed / In progress /
    Pending), today's task, a Quick Links grid, and the dark JavaScript-tasks
    side panel.
  - **Specific Training** — the enrolled/paid programme for candidates who
    **trained with us**. Gated behind `trainingUnlocked`; a course catalog
    with search + filters and course cards (Enrolled / Paid badges).
  - **Suggested Training** — recommendations, **open to everyone** including
    candidates who didn't subscribe (Recommended / Popular badges, some free).
  - Gating uses `trainingUnlocked` (set by the unlock-training payment in the
    AI-interview flow, or the demo "Unlock training" button). Overview and
    Specific show an unlock gate until then; Suggested is always available.
    "Save" bookmarks a course into `app.savedTraining`. Course lists are
    placeholder arrays in `components/dashboard/trainingData.js`.

## Interviewer portal (Professional / HR)

A second role — the interviewer — lives under `/interviewer/*` with its own
shell (sidebar + topbar, a Professional/HR badge, and a "Candidate view"
switch back). One shared portal serves both Professional and HR; the role is
a label + data filter (toggle it in the sidebar). Reach it from the **login**
page ("Enter as Professional / HR") — a demo shortcut standing in for real
role-based accounts.

- **Dashboard** (`/interviewer`) — stat cards (interviews conducted/scheduled,
  payment earned, upcoming, avg feedback), an interviews-conducted bar chart
  and feedback-outcomes donut, a scheduled-interviews table, a candidate
  feedback list, and a payments table.
- **Interview** (`/interviewer/interview`) — a "$50 per interview" accept/
  decline banner, a candidate waiting-list with Accept/Decline, and a
  feedback list linking to each candidate.
- **Candidate notes + AI final feedback** (`/interviewer/candidate/[id]`) —
  the key feature: the interviewer rates the candidate and writes notes
  (strengths / areas to improve / free notes). The page shows **all
  interviewers' notes** (others on file + this one), and a **Generate AI
  final feedback** action merges them into one synthesised result — a
  verdict, average rating, combined strengths/improvements, and a summary —
  labelled as the final feedback shown to the candidate. The synthesis is a
  deterministic stand-in (`synthesizeNotes()` in
  `components/interviewer/data.js`); swap it for the real model. Saved notes
  and the AI result persist in state (`app.interviewerNotes`, `app.aiFinal`).
- **Earnings** (`/interviewer/earnings`) — wallet balance, recent activity,
  transactions. **Notifications** (`/interviewer/notifications`) — interview
  requests and account updates.

HR uses the same screens (per your "HR follows same thing") — switch the role
in the sidebar. All interviewer data is placeholder in
`components/interviewer/data.js`.

## Recruiter portal (`/recruiter/*`)

Partner-company recruiters who reach vetted candidates directly — the end of
the pipeline. Enter from login ("Enter as Recruiter"). Shares the reusable
`components/PortalShell.js` shell.

- **Dashboard** — stats (data candidates, jobs available, total recruited),
  top board candidates, and a "Review All Candidates" table.
- **Candidate List** (`/recruiter/candidates`) — the **job candidate board**:
  filter by role/level/location, then candidate cards (experience, skills,
  rating, "Interviewed" status) with **Message** and **Download CV** — this is
  where recruiters reach successful candidates directly to hire them.
- **Profile** and **Settings** (notifications toggles + privacy).
- Data is placeholder in `components/recruiter/data.js`.

## NexIT Admin (`/admin/*`)

Platform oversight. Enter from login ("Enter as NexIT Admin").

- **Dashboard** — platform stats with deltas, an applications-trend line
  chart, a user-distribution donut, and a pipeline-conversion bar chart
  (AI → Professional → HR → Board → Hired).
- **User List** — everyone grouped (pending approval, active candidates,
  partner recruiters).
- **Requests** — approve/decline interviewer & recruiter applications and
  payout requests (working accept/decline).
- **Notifications** and **System Settings** (grouped toggles).
- Data is placeholder in `components/admin/data.js`.

**Role switching (demo):** the login page has quick entries for every role
(candidate via the normal form; Professional/HR interviewer; Recruiter; NexIT
Admin), standing in for real role-based accounts. `viewAs` in the context
holds the current portal; each portal's sidebar has "Switch role" (back to
login) and "Logout". Swap this for real auth + roles on the backend.

These screens were built from the dashboard/schedule/CV screenshots plus
the established design system (the Figma MCP is rate-limited on the Starter
plan, so I didn't pull each frame exactly). Text, numbers, and slot data are
placeholders. Available time slots, job listings and stats are hard-coded
arrays at the top of each page — swap them for API data.

## Candidate auth flow (navigation + state)

State lives in `components/context/AuthContext.js` — a front-end-only mock
(no backend). It holds the multi-step signup data, a "logged in" flag, and
the candidate's app state (CV + scheduled interviews), all mirrored to
`localStorage` so a refresh mid-flow doesn't lose progress.
Swap its methods (`login`, `completeSignup`, `updateSignup`, `logout`) for
real API calls when the backend exists; the screens already read/write
through it.

The wired path:

```
landing → /signup (5 steps) → /verify-email → /congratulations → /dashboard
landing → /login ──────────────────────────────────────────────→ /dashboard
/login → /forgot-password (email → code → verified) → /reset-password → /login
/dashboard is guarded: no session → redirect to /login
```

### Exact vs. interpreted screens

- **Exact from Figma:** `/login` (frame 113:551) and **Sign Up step 1**
  (frame 113:178) — pulled via the Figma MCP, matched to the pixel.
- **Built on the same design system, interpreting your described model:**
  signup steps 2–5 (professional background → target job → CV upload →
  review), the forgot/reset password steps, email confirmation, and the
  congratulations screen. The Figma Starter plan rate-limits the MCP to
  ~2 screen pulls per window, so I couldn't pull the remaining exact
  frames in one pass. Every one reuses the exact `AuthLayout`, colors,
  fonts and input styles from the two confirmed screens, so swapping in
  the precise Figma layout later is a contained change per file. Send me
  any of those frames (or wait for the limit to reset) and I'll match
  them exactly.

## Known simplifications (carried over from the HTML version)

- The scrolling company-logo strip is placeholder styled text (the source
  file used SVG clip-masks for those marks); swap in real logo SVGs if you
  have them.
- The three "mock UI" preview panels in the How-it-works section (CV
  stats, AI analysis, candidate progress) are rebuilt with plain divs/CSS
  rather than the dense nested vector groups in the original — visually
  close, easier to maintain.
- FAQ accordion uses native `<details>/<summary>` (interactive, no JS
  needed) with an inline SVG icon that flips from **+** to **–** via CSS
  when open.
- The newsletter form in the footer doesn't post anywhere yet — wire
  `components/Footer.js`'s `<form>` up to your API route or provider of
  choice.
- The candidate auth flow (landing, login, signup, password recovery,
  confirmation, dashboard) is built. Other screens in the Figma file —
  CV Upload detail, AI Interview, Professional Interview, Training,
  Schedule, Payment, Profile, Settings — aren't built yet.
- OAuth ("Continue with Google/Apple") and the forms are UI-only: login
  accepts any credentials, the verification codes aren't checked, and no
  requests are sent. Wire these to your backend when it's ready.
