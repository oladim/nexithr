-- =====================================================================
-- 0022 — Result integrity: make assessment outcomes tamper-proof.
--
-- Previously a candidate could write their OWN ai_interviews, stage_attempts
-- and token_transactions rows (RLS allowed candidate_id = auth.uid()), and
-- could flip candidates.on_board / candidates.tokens directly from the browser.
-- That let someone fabricate a passing result, self-board, or grant themselves
-- retake tokens.
--
-- These are now written ONLY by the server (service role) through the
-- /api/interview/* routes, which compute the verdict and enforce the rules.
-- So we drop the candidate write policies (keep read), and extend the
-- candidates column guard from 0021 to freeze on_board / tokens /
-- last_ai_attempt_at for ordinary users. Idempotent.
-- =====================================================================

-- ---- ai_interviews: read own; writes are service-role / admin only ----
drop policy if exists ai_write on public.ai_interviews;
create policy ai_write on public.ai_interviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- stage_attempts: read own; writes are service-role / admin only ----
drop policy if exists stages_write on public.stage_attempts;
create policy stages_write on public.stage_attempts
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- token_transactions: read own; writes are service-role / admin only ----
drop policy if exists tokens_write on public.token_transactions;
create policy tokens_write on public.token_transactions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---- Extend the candidates column guard (from 0021) ----
create or replace function public.lock_privileged_candidate_cols()
returns trigger language plpgsql as $$
begin
  if current_user in ('authenticated', 'anon') and not public.is_admin() then
    new.subscription_until  := old.subscription_until;  -- granted by payment-verify (service role)
    new.on_board            := old.on_board;            -- set only after a real HR pass (service role)
    new.tokens              := old.tokens;              -- spent/granted by the server only
    new.last_ai_attempt_at  := old.last_ai_attempt_at;  -- stamped by the AI interview API
  end if;
  return new;
end $$;
-- (trigger trg_lock_candidate_cols from 0021 already points at this function.)
