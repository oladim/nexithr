-- =====================================================================
-- CV review — let admins record a decision + a note to the candidate.
-- Status already exists on cvs (cv_status: Pending review / Approved /
-- Rejected). This adds the reviewer's note and audit fields.
-- =====================================================================
alter table public.cvs add column if not exists review_note text;
alter table public.cvs add column if not exists reviewed_by uuid references public.profiles(id) on delete set null;
alter table public.cvs add column if not exists reviewed_at timestamptz;

-- A 'Changes requested' status is useful alongside Approved / Rejected.
-- (Top-level statement: ADD VALUE cannot run inside a transaction/DO block.)
alter type cv_status add value if not exists 'Changes requested';
