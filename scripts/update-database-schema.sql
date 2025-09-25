
-- Update existing users table to match the signup form requirements
-- Run this in your Supabase SQL Editor

-- Add missing columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dietary_type VARCHAR(50);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS dietary_other TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_allergies VARCHAR(10);
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS allergies_details TEXT;

-- Drop the old dietary_restrictions column if it exists (since we're using dietary_type instead)
ALTER TABLE public.users DROP COLUMN IF EXISTS dietary_restrictions;

-- Add constraints for the new fields
ALTER TABLE public.users ADD CONSTRAINT users_dietary_type_check 
CHECK (dietary_type IN ('vegetarian', 'non-vegetarian', 'other') OR dietary_type IS NULL);

ALTER TABLE public.users ADD CONSTRAINT users_has_allergies_check 
CHECK (has_allergies IN ('yes', 'no') OR has_allergies IS NULL);

-- Update the role constraint to ensure it matches exactly what the code expects
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
CHECK (role IN ('delegate', 'chair', 'admin'));

-- Verify the updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show current table contents to verify
SELECT COUNT(*) as total_users FROM public.users;

COMMENT ON COLUMN public.users.dietary_type IS 'User dietary preference: vegetarian, non-vegetarian, or other';
COMMENT ON COLUMN public.users.dietary_other IS 'Specific dietary requirement when type is other';
COMMENT ON COLUMN public.users.has_allergies IS 'Whether user has allergies: yes or no';
COMMENT ON COLUMN public.users.allergies_details IS 'Details about user allergies if has_allergies is yes';
