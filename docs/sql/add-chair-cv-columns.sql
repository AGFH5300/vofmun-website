-- Add chair CV storage columns to the users table
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS chair_cv_url text,
  ADD COLUMN IF NOT EXISTS chair_cv_storage_path text,
  ADD COLUMN IF NOT EXISTS chair_cv_file_name text,
  ADD COLUMN IF NOT EXISTS chair_cv_uploaded_at timestamp with time zone;
