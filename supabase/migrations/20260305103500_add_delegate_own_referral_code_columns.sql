-- Adds dedicated delegate-owned referral code columns on public.users.
-- Idempotent migration: safe to run even if columns/index already exist.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS own_referral_code text,
  ADD COLUMN IF NOT EXISTS own_referral_code_generated_at timestamptz,
  ADD COLUMN IF NOT EXISTS own_referral_code_emailed_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS users_own_referral_code_unique_idx
  ON public.users (own_referral_code)
  WHERE own_referral_code IS NOT NULL;
