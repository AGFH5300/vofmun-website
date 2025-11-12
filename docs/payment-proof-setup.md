# Payment Proof Storage Setup

Follow these steps to prepare Supabase storage so the payment proof upload flow can succeed.

## 1. Confirm core Supabase environment variables

Make sure these variables are present wherever the app runs (local `.env`, hosting provider dashboard, etc.):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Restart the dev server after updating environment variables so Next.js picks them up.

## 2. Create the payment proof bucket (one-time)

If you do **not** supply a Supabase service-role key, the app cannot create the bucket on your behalf. Create it manually:

1. Sign in to the [Supabase dashboard](https://app.supabase.com/) and open the project linked to this site.
2. Go to **Storage → Buckets**.
3. Click **New bucket**, name it `payment-proofs`, and set **Public bucket** to **Enabled**.
4. Save the bucket.

If you prefer a different bucket name, repeat the steps above with your custom name and add one of these environment variables so the app uses it:

- `NEXT_PUBLIC_SUPABASE_PAYMENT_PROOF_BUCKET`
- `NEXT_PUBLIC_SUPABASE_PAYMENT_PROOFS_BUCKET`
- `SUPABASE_PAYMENT_PROOF_BUCKET`
- `SUPABASE_PAYMENT_PROOFS_BUCKET`
- `SUPABASE_STORAGE_PAYMENT_PROOF_BUCKET`
- `SUPABASE_STORAGE_PAYMENT_PROOFS_BUCKET`

## 3. Grant upload permissions (row-level security)

If you see an error like `new row violates row-level security policy`, Supabase is blocking uploads because no policy allows the request. Fix it either through the dashboard or by running the SQL below.

**Dashboard steps**

1. Open **Storage → Buckets** and select your payment proof bucket.
2. Go to the **Policies** tab and click **New policy**.
3. Name it something like **Allow anon uploads**.
4. Choose **Object access** and enable the **INSERT** operation.
5. Under **Allowed roles**, enable **anon** and (optionally) **authenticated**.
6. Leave the policy definition as `true` so any request with those roles can upload.
7. Save the policy.

**SQL alternative**

Replace `payment-proofs` if you picked a different bucket name:

```sql
create policy "Allow anon uploads"
on storage.objects for insert
using (bucket_id = 'payment-proofs' and auth.role() in ('anon', 'authenticated'))
with check (bucket_id = 'payment-proofs' and auth.role() in ('anon', 'authenticated'));
```

## 4. (Optional) Enable automatic provisioning

Adding a Supabase service-role credential lets the app verify and create the bucket automatically. Set **one** of the following variables:

- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SERVICE_KEY`
- `SUPABASE_SERVICE_ROLE`

Keep service-role credentials server-side only—they grant elevated privileges and must never be exposed to browsers or client bundles.

## 5. Retry the upload

After the bucket exists (and any environment variables are in place), restart the dev server and try uploading the payment proof again. The API will now find the bucket and save the file successfully.
