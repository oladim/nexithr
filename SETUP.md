# NexIT-Africa — Backend Setup (Supabase)

The app runs in **two modes**:

- **Demo mode** (default, zero setup) — no keys needed. Data lives in the
  browser (localStorage). Great for a quick look. Just `npm install && npm run dev`.
- **Real mode** — a real Postgres database with authentication and file
  storage via [Supabase](https://supabase.com). Follow the steps below to turn
  it on. The app switches automatically once the keys are present.

---

## 1. Create a Supabase project (free)

1. Go to <https://supabase.com> → **New project**.
2. Pick a name, a strong database password, and a region near your users.
3. Wait ~2 minutes for it to provision.

## 2. Create the database schema

In the Supabase dashboard, open **SQL Editor → New query**, then run each file
from this repo, in order:

1. `supabase/migrations/0001_init.sql`  — tables, roles, RLS, signup trigger
2. `supabase/migrations/0002_storage.sql` — CV + avatar storage buckets
3. `supabase/migrations/0003_admin.sql`  — the `set_user_role` helper (below)
4. …through `supabase/migrations/0020_landing.sql` — run **every** file in order.
   **0009** adds admin pass marks & pricing, role enable/disable, subscriptions
   and Paystack payments. **0010** adds the academy model: AI-generated
   suggested-training plans, diagnostic bands + optional reviewer approval,
   NexIT-curated specific courses, testimonials/outcomes, and the employer
   hire-request flow. Both are idempotent (safe to re-run).

### Premium landing page + managed hero spotlights (0020)

- The public landing page was redesigned (premium hero, interactive **How it
  works** stepper, expanded FAQ, animations, clearer copy) and now uses the
  bundled team photos in `public/images`.
- The hero&apos;s scrolling spotlight cards (&ldquo;NexIT is a life-changing discovery&rdquo;)
  are **admin-managed**: **Admin → Landing Page** lets you add/edit/reorder
  spotlights (quote, name, role, image — pick a bundled photo or paste a URL),
  show/hide each one, and set **how many** appear in the hero. It&apos;s gated by a
  new **Landing Page** permission (super-admins have it automatically).
- The login / sign-up screens now link back to the landing page (brand logo and
  a &ldquo;Back to home&rdquo; link).
- Run `0020_landing.sql` (adds `landing_spotlights` + `landing_spotlight_count`,
  and seeds four default spotlights).

### Social sign-in toggles (0019)

- **Admin → System Settings → Sign-in options** has toggles for **Continue with
  Google** and **Continue with Apple**. Both are **off by default**, so the login
  and sign-up pages show no social buttons until an admin turns one on. Enable a
  provider only after configuring it in Supabase Auth.
- The old login quick-portal links (Interviewer / Recruiter / NexIT Admin) have
  been removed from the login page.
- Run `0019_oauth_settings.sql` (adds `oauth_google_enabled` / `oauth_apple_enabled`).

### Users, groups & permissions + mandatory 2FA (0018)

- **Mandatory two-factor authentication for everyone (including admins).** Every
  signed-in user must enrol in Google Authenticator (TOTP) before they can use
  any portal. If an account hasn't set it up, the portal is replaced by a
  required enrollment screen (scan QR → enter code). After enrollment, each login
  asks for a fresh 6-digit code. Demo mode (no Supabase) is exempt.
- **Admin groups & feature permissions (RBAC).** Admins can be split into
  **groups**, and each group is granted a set of **feature permissions** (CV
  Reviews, Interviews, AI Results, Specific Training, Job Board, Users & Groups,
  Settings, etc. — the catalog lives in `lib/permissions.js`). A group member only
  sees the admin menu items their group allows, and pages they lack are blocked.
- **Super-admin.** An admin with **no group** holds every permission. All your
  pre-existing admins stay super-admins automatically (no data migration needed).
- **Create users from the app.** **Admin → Users & Groups → Users → Create user**
  makes an account with its email pre-confirmed and (for staff) auto-approved, sets
  its role, and — for admins — assigns a group. Only a super-admin can create
  another admin or grant the admin role.
- Managing groups/users requires the **Users & Groups** permission (super-admins
  always have it). All group/user writes run server-side with the service-role key.
- Run `0018_groups.sql` (adds the `groups` table and `profiles.group_id`).

### Quizzes & suggested resources (0017)

- **Auto-graded quizzes** — add a module of type **Quiz** and build multiple-choice
  questions (mark the correct option). The candidate answers in-app and it's
  **graded instantly** (scaled to the module's max score); correct answers never
  reach the browser. Quiz scores count toward the course overall.
- **Admin-managed suggested resources** — **Admin → Suggested Resources** curates
  free/low-cost links (per role or for everyone, tagged technical / administrative /
  general). These replace the old static list on the candidate **Suggested
  Training** page, shown alongside each candidate's AI-generated plan.
- Run `0017_quiz_resources.sql`.

### Training LMS (0016)

- **Specific Training is now a real course system.** Admins open a course under
  **Admin → Specific Training → Content & grading** and add **modules** of any
  type — a reading (text), a **video** (YouTube/Vimeo/MP4 URL), a **PDF**, an
  **assignment**, or a **test**. Assignments/tests carry a **max score**.
- **Candidates** who've purchased the course open it from **Training → Specific**,
  watch/read the material, and **submit assignments & tests** (typed answer
  and/or file upload).
- Admins **grade** each submission (score + feedback) on the Grading tab, then
  **release results** per student — the app computes an **overall course score**
  (earned ÷ total possible) and notifies them. Grades and the overall score are
  hidden from the candidate until released.
- Run `0016_lms.sql` (adds `course_modules`, `enrollments`, `submissions` and a
  private `training` storage bucket for materials and submissions).

### Two-factor auth & staff suspension (0014)

- **Google Authenticator (TOTP) 2FA** — app-level, independent of Supabase MFA.
  Users enable it under **Account security** (`/account/security`, also on the
  candidate Settings page): scan the QR in Google Authenticator and confirm a
  code. At login, accounts with 2FA on must enter a 6-digit code after their
  password. Run `0014_totp.sql` (adds `profiles.totp_enabled` and a service-only
  `user_totp` table — the secret is never exposed to the browser).
  > Note: enforcement is at the app/login layer. For DB-level enforcement you'd
  > bind it to the session; this is a pragmatic MVP of Authenticator-based 2FA.
- **Suspend/reactivate staff** — admins can suspend an approved interviewer or
  employer from **Admin → Staff Approvals** (and reactivate later). Suspended
  accounts are locked out of their portal with a notice.
- The interviewer sidebar no longer shows the Professional/HR switch or
  "Candidate view" — an interviewer's kind is fixed to what they signed up as.

### Staff signup & approval (0013)

- **Signup now offers a role**: Candidate, Professional Interviewer, HR
  Interviewer, or Employer/Recruiter. Candidates are **auto-approved**. The three
  staff roles are created in a **pending** state (the signup trigger clamps any
  unexpected role — e.g. admin — to candidate, so no one can self-elevate).
- Pending interviewers/employers are **gated out of their portal** and shown an
  upload screen: interviewers upload their **CV**, employers upload
  **organisational documents** (stored privately in the `staff-docs` bucket).
- **Admin → Staff Approvals** lists these applications, opens each document, and
  **approves or declines** with a note; the applicant is notified in-app and by
  email. Approval unlocks their portal on next load.
- Run `0013_staff_onboarding.sql` (it also creates the `staff-docs` storage
  bucket and updates the signup trigger).

### Job board (0012)

- A **Job Board** (`/dashboard/jobs`) lists approved openings. Every candidate can
  browse; **only board-ready candidates** (passed AI + Professional + HR) can
  apply — enforced server-side.
- **Employers** (recruiter role) post jobs at `/recruiter/jobs`; they go live only
  after an **admin approves** them in `/admin/jobs`. Admins can also post
  openings directly (auto-approved), approve/close, and delete.

### Scheduling & Google Meet (0011)

- Human interviews are **gated**: a candidate can book **Professional** only after
  passing the AI interview, and **HR** only after passing Professional. A
  **Professional + HR (same call)** option books both at once (needs AI passed).
- Booking creates a **Google Meet** link shown on the candidate's page and on the
  interviewers' dashboards. With `GOOGLE_SERVICE_ACCOUNT_KEY` +
  `GOOGLE_IMPERSONATE_EMAIL` set (domain-wide delegation, Calendar scope), a real
  Meet event is created and the interviewers are **invited** (it appears on their
  calendars). Without Google keys, a realistic **mock** link is generated so the
  flow is fully testable. The candidate also gets an "Add to my calendar" link.

### The academy model (0010)

- The AI interview is a **Technical Readiness diagnostic**, not a pass/fail gate.
  It classifies into **Ready / Almost there / Foundational** bands (thresholds in
  Admin → Settings) and generates a **personalised suggested-training plan**
  (technical + administrative) the candidate can do for free. Candidates get a
  configurable number of **free retakes** before the one-month cooldown.
- **Specific Training** is **NexIT-curated** per role, in two paid tiers
  (**Foundational** / **Intensive**, Intensive includes live practicals and
  placement support). Curate courses in **Admin → Specific Training**; set tier
  prices in Settings (global) or per role in Role Requirements.
- Optional **reviewer approval**: turn on "hold AI results" in Settings and
  confirm/override each result in **Admin → AI Results** before candidates see
  them.
- **Employers** (recruiter role) can **Request to hire** board candidates; track
  and mark them **placed** in **Admin → Hire Requests**. Set the placement fee in
  Settings.
- **Testimonials/outcomes** are admin-curated (**Admin → Testimonials**) and shown
  on the training pages. A **data & recording notice** (NDPR) lives at
  `/dashboard/data-privacy` — edit it with your registered details before launch.

### Admin controls, pass marks & payments (0009)

- **Admin → Settings** sets the **pass marks** for the AI, Professional and HR
  interviews, the **annual subscription** price, and the **default specific-
  training** price. **Admin → Role Requirements** can **open/close** each role
  (candidates can only upload a CV for an *open* role) and set a **per-role
  training price**. **Admin → Interviews** can reset a stage or **approve
  (override)** a stage so a candidate can proceed.
- **Candidates**: after an AI attempt they must wait **one month** to retake,
  unless they buy the **annual subscription** (which also unlocks *Suggested
  Training*). **Specific Training** is a one-time per-role purchase that includes
  live practical sessions.
- **Payments use Paystack.** Set `PAYSTACK_SECRET_KEY` and `PAYSTACK_PUBLIC_KEY`
  in `.env.local`. **Without keys**, the app runs a *mock* payment flow that
  always succeeds, so you can test subscriptions and training purchases end to
  end before wiring real keys. Prices are shown in Naira (₦).

(Paste the file contents, click **Run**. Each should finish with "Success".)

> Prefer the CLI? With the [Supabase CLI](https://supabase.com/docs/guides/cli)
> installed and logged in: `supabase link --project-ref <ref>` then
> `supabase db push`.

## 3. Add your keys

1. In the dashboard: **Project Settings → API**.
2. Copy the **Project URL**, the **anon public** key, and the **service_role** key.
3. In the project root, copy `.env.example` to `.env.local` and fill them in:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...            # anon public
SUPABASE_SERVICE_ROLE_KEY=eyJ...                # service_role (keep secret)
```

> The `service_role` key bypasses security — never commit it or expose it to
> the browser. It's only used by the seed script. `.env.local` is gitignored.

### Email notifications (Resend)

Every pipeline action that informs a candidate, Professional or HR interviewer
now sends a **branded email** in addition to the in-app notification — CV review
decisions, AI readiness report release, stage approvals, **interview scheduling
(candidate + both interviewers get the Google Meet link)**, training result
release, staff approval/suspension, job-application updates, and subscription /
specific-training purchase confirmations. It's wired through `lib/notify.js`
(`notifyUser`) so both channels always fire together.

To turn on real email, add to `.env.local`:

```
RESEND_API_KEY=re_...                 # from resend.com
EMAIL_FROM="NexIT-Africa <noreply@yourdomain.com>"   # a verified Resend sender/domain
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com       # used for the buttons in emails
```

**Without `RESEND_API_KEY`, email is a no-op** — the app still records every
in-app notification and works end to end, so you can develop without an email
provider. (The legacy `CV_REVIEW_FROM_EMAIL` is still accepted as the sender.)

## 4. Seed demo data (optional but recommended)

Creates the demo logins and fills the boards with real rows:

```
node scripts/seed-demo.mjs
```

Demo accounts (password **`Password123!`** for all):

| Role        | Email                       |
|-------------|-----------------------------|
| Candidate   | candidate@nexit.africa      |
| Interviewer | interviewer@nexit.africa    |
| HR          | hr@nexit.africa             |
| Recruiter   | recruiter@nexit.africa      |
| Admin       | admin@nexit.africa          |

## Reviewing CVs (admin)

Admins fully manage roles under **Role Requirements** (`/admin/role-requirements`)
— **add**, **edit**, or **delete** roles, each with a required-skills list, a
minimum experience, and a long free-text **role brief / detailed requirements**.
Stored in the `role_requirements` table and seeded with sensible defaults. Then, on the **CV Reviews** page
(`/admin/cv-reviews`), opening a submission shows:

- an **AI CV analysis** — an automated match of the candidate's declared skills
  against that role's required skillset: a score, which skills are present, and
  which are missing, with a written recommendation;
- an **inline preview** of the uploaded PDF (embedded from Storage);
- a **note box pre-filled** from the analysis (edit before sending).

**Approve**, **Request changes**, or **Reject** saves the decision + note; the
candidate is notified in-app immediately and by email if a provider is set up,
and sees the note on their own CV page.

### How the CV analysis works (and reading the actual PDF)

By default the analysis is a **live skills match** — it scores the candidate's
declared skills against the role's required skills (it's dynamic per candidate,
not a fixed string, and labelled "skills match" in the UI). To have AI **read
the real CV text**, set `ANTHROPIC_API_KEY` in `.env.local`; a "Read the CV with
AI" button then appears in the review overlay. It downloads the stored PDF,
extracts its text, and asks Claude to assess it against the role (the badge
switches to "AI read of CV"). If the key is missing, the file isn't stored, or
text can't be extracted, it falls back to the skills match and tells you which.

**If the CV preview says "No file stored":** that row has no file in Storage.
Common reasons:
- The row was created by an older build that didn't attach the file. Fix: the
  candidate re-uploads on the CV Upload page (the candidate now sees a "File not
  on record — please re-upload" prompt, and admins get an "Ask candidate to
  re-upload" button in the review overlay).
- The Storage buckets/policies aren't set up. Run
  `supabase/migrations/0008_storage_idempotent.sql` — it's **safe to re-run**
  (it drops-then-creates the policies, so no "policy already exists" error) and
  supersedes `0002_storage.sql`.

Uploads now surface the real error (e.g. "Bucket not found") instead of silently
saving a fileless record.

Email is optional: set `RESEND_API_KEY` and `CV_REVIEW_FROM_EMAIL` in
`.env.local` (any Resend-style HTTP provider works — see `lib/email.js`).
Without them, reviews still notify the candidate in-app.

## Interview panels & feedback (interviewer / HR)

Each human stage is a **panel** — several interviewers can each leave their own
note (rating, strengths, areas to improve) for the same candidate and stage.
Open a candidate from the interviewer dashboard to see the whole panel's notes,
generate the AI-synthesised final feedback, and — with "Send a note to the
candidate" — message the candidate directly (in-app + email, same provider as
above). Useful when answers or the CV don't match the role. Notes are stored in
`interviewer_notes`, one row per interviewer per candidate per stage.

## Making a real admin (not the demo account)

**Public signup only ever creates a candidate** — the role is hard-coded, so no
one can register themselves as an admin, interviewer, or recruiter. Elevated
roles are granted deliberately by you, the project owner. Two ways:

**A. Promote an existing account (recommended).** Have the person sign up
normally (they become a candidate), then in the Supabase **SQL Editor** run:

```sql
select public.set_user_role('you@yourcompany.com', 'admin');
```

Use `'recruiter'` or `'interviewer'` the same way. The change takes effect on
their next login. It's non-destructive — it never deletes existing data.

**B. Create the account directly.** In the dashboard: **Authentication → Users
→ Add user**. Add the email + password, and under **User Metadata** put:

```json
{ "role": "admin", "full_name": "Your Name" }
```

The signup trigger then builds a proper admin profile (no candidate row).

> Only the project owner can do either — the `set_user_role` function is
> revoked from normal users, and the Auth dashboard requires project access.
> Never expose an admin-promotion path in the app's public signup.

To see who currently holds each role:

```sql
select email, role from public.profiles order by role, email;
```

## Email confirmation (important for first login)

Supabase turns on **"Confirm email" by default**, which means a newly registered
candidate **cannot log in until they confirm their email** — otherwise sign-in
fails and they bounce back to the login page. You have two options:

- **Quick testing / MVP** — turn it off: dashboard → **Authentication →
  Sign In / Providers → Email → uncheck "Confirm email"**. Now signup logs the
  candidate straight in.
- **Production** — leave it on. The app is wired for it: the signup screen shows
  the 6-digit code entry, `verifyOtp` confirms the account, and the confirmation
  **link** is handled by `/auth/callback`. (For the 6-digit code to arrive by
  email, set the **Confirm signup** email template to use `{{ .Token }}`; the
  default template sends a link, which the callback route also handles.)

The login screen now shows a clear "please confirm your email first" message
instead of silently failing.

## Managing roles from the app

Once you're an admin, open **Admin → Users & Groups** (`/admin/users`). In real
mode this has two tabs:

- **Users** — every account with a dropdown to set its role (candidate /
  interviewer / recruiter / admin), a group dropdown for admins, a 2FA status
  column, and a **Create user** button. Role/role changes call a secured API
  route that (1) verifies you have the Users & Groups capability from your
  session and (2) applies the change with the service-role key — which never
  touches the browser. You can't change your own admin role or group (so you
  can't lock yourself out), and only a super-admin can grant/create admins.
- **Groups & permissions** — create groups and tick which admin features each
  one can access. Assign admins to a group from the Users tab; an admin with no
  group is a super-admin with full access.

## 5. Run

```
npm install
npm run dev
```

Open <http://localhost:3000/login>. Sign up to create a real account, or use a
demo login above. The quick-portal links on the login page sign into the
matching seeded account.

---

## What's wired to the database

- **Authentication** — real signup/login/logout with sessions; protected routes
  (`/dashboard`, `/interviewer`, `/recruiter`, `/admin`) enforced in middleware;
  role-based routing after login.
- **Candidate flow** — profile, CV upload (to Storage), interview scheduling,
  AI attempt, Professional/HR stage results, and token-based retries all read
  and write real rows through Row-Level Security.
- **Live reads** — the recruiter **candidate board** (real on-board
  candidates); the **admin dashboard** — KPI cards, user-distribution donut,
  the **applications trend** (real signups per month) and **pipeline
  conversion** funnel (real counts at each stage); the **candidate dashboard**
  (real token balance + open jobs); and the **interviewer dashboard** — stats,
  scheduled interviews, candidate feedback and payments, all from the database.
  Everything falls back to sample data automatically in demo mode.
- **Reference data** — jobs, on-board candidates, interviewer payments,
  assigned interviews and notes are seeded and exposed through `lib/db.js`.

### Still illustrative
Only two small things remain on sample data: the interviewer "Interviews
Conducted" monthly bar chart (needs per-month history to be meaningful) and the
notification lists. Everything else visible is live.

## Security model (Row-Level Security)

Every table has RLS enabled. In short: a candidate can only see and change their
own rows; on-board candidates are visible to recruiters/interviewers/admins;
interviewers manage their own notes and see their assigned interviews; admins
can read everything. Policies live at the bottom of `0001_init.sql`.

## Turning it back off

Delete or blank the keys in `.env.local` and restart — the app returns to demo
mode. Your Supabase data is untouched.
