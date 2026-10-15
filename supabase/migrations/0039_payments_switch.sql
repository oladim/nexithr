-- =====================================================================
-- 0039 — Master switch for online payments.
-- Off by default: until an admin turns it on (and Paystack is connected),
-- candidates see "Payment will be available soon" with a WhatsApp contact
-- instead of a payment page. There is no mock/test payment mode any more.
-- Idempotent.
-- =====================================================================
alter table public.app_settings add column if not exists payments_enabled boolean not null default false;
