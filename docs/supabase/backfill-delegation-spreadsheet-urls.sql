-- Adds a spreadsheet_url column and backfills it using Supabase metadata.
-- The script figures out the public storage URL and delegation bucket name
-- so you can run it as-is without editing placeholders.

alter table public.school_delegations
  add column if not exists spreadsheet_url text;

-- Populate spreadsheet_url for any existing rows using the configured bucket
-- and Supabase's storage public URL settings. If storage_public_url is not
-- available the script falls back to NEXT_PUBLIC_SUPABASE_URL.
do $$
declare
  storage_public_url text := nullif(current_setting('app.settings.storage_public_url', true), '');
  supabase_url text := nullif(current_setting('app.settings.supabase_url', true), '');
  bucket_name text := nullif(current_setting('app.settings.supabase_delegation_spreadsheets_bucket', true), '');
begin
  if storage_public_url is null then
    if supabase_url is null then
      raise exception 'Supabase URL could not be determined. Please set NEXT_PUBLIC_SUPABASE_URL.';
    end if;

    storage_public_url := rtrim(supabase_url, '/') || '/storage/v1/object/public';
  end if;

  if bucket_name is null then
    select name
      into bucket_name
      from storage.buckets
     where name ilike '%delegation%'
     order by created_at asc
     limit 1;
  end if;

  if bucket_name is null then
    bucket_name := 'school-delegation-spreadsheets';
  end if;

  update public.school_delegations as sd
     set spreadsheet_url = concat(rtrim(storage_public_url, '/'), '/', bucket_name, '/', sd.spreadsheet_storage_path)
   where sd.spreadsheet_url is null;
end $$;

alter table public.school_delegations
  alter column spreadsheet_url set not null;
