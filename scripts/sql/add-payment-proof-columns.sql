-- Adds storage metadata for payment proof uploads and payer context.
ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS payment_proof_url text,
    ADD COLUMN IF NOT EXISTS payment_proof_storage_path text,
    ADD COLUMN IF NOT EXISTS payment_proof_file_name text,
    ADD COLUMN IF NOT EXISTS payment_proof_payer_name text,
    ADD COLUMN IF NOT EXISTS payment_proof_role character varying(20),
    ADD COLUMN IF NOT EXISTS payment_proof_uploaded_at timestamptz;
