-- =====================================================================
-- A stage has a PANEL of interviewers, each leaving their own note. Let any
-- staff member (interviewer / recruiter / admin) read all notes for a
-- candidate & stage, so the panel and the AI synthesis can see the full set.
-- (Candidates still don't read raw notes here — they get the synthesised
--  feedback and any note an interviewer explicitly sends them.)
-- =====================================================================
drop policy if exists notes_select on public.interviewer_notes;
create policy notes_select on public.interviewer_notes
  for select to authenticated
  using (
    interviewer_id = auth.uid()
    or candidate_id = auth.uid()
    or public.is_staff()
  );
