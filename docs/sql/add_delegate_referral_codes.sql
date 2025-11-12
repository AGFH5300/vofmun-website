-- Adds a JSONB column for storing multiple referral codes submitted by delegates.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS delegate_referral_codes jsonb;

-- Ensure existing delegate rows have an empty array to simplify querying.
UPDATE public.users
SET delegate_referral_codes = '[]'::jsonb
WHERE role = 'delegate' AND delegate_referral_codes IS NULL;
