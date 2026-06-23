# Render memory hardening

## Why uploads changed

Render free-tier web services have a 512 MB RAM limit. Sending files as base64 strings inside JSON is memory-expensive because the request body, decoded JSON string, and decoded `Buffer` can exist at the same time. Large receipts, CVs, or spreadsheets could therefore create short memory spikes and crash the Next.js process.

## Current architecture

Public forms now request a short-lived signed Supabase Storage upload URL from `/api/uploads/sign` using only metadata: upload purpose, original filename, MIME type, and byte size. The browser uploads the original `File` directly to Supabase Storage. The final form submission sends only a signed upload reference, and the server verifies the purpose, bucket, path prefix, expiry, signature, metadata, and object existence without downloading the file.

Render build and start commands remain unchanged.

## Required environment variables

Set these in Render:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only; used to create signed upload URLs and verify storage objects.
- `UPLOAD_INTENT_SECRET` — server-only; used to sign upload references.

Generate `UPLOAD_INTENT_SECRET` with at least 32 random bytes, for example:

```bash
openssl rand -base64 48
```

Do not prefix either secret with `NEXT_PUBLIC_`.

## Supabase Storage dashboard settings

Keep the existing buckets and public/private access unchanged unless you plan a separate privacy migration. Recommended bucket limits:

- `payment-proofs`: 5 MB; allow PDF, PNG, JPG/JPEG, HEIC/HEIF, and WEBP.
- `chair-cvs`: 5 MB; allow PDF, DOC, and DOCX.
- `school-delegation-spreadsheets`: 10 MB; allow XLSX, XLS, XLSM, ODS, CSV, and TSV.

For stronger privacy later, these buckets can be made private and admin views can be updated to use signed download URLs. That should be a separate migration because existing public document links may depend on current bucket access.

## Optional guardrail

`NODE_OPTIONS=--max-old-space-size=384` may be set in Render as a guardrail so V8 leaves headroom for native memory inside a 512 MB service. This is not the fix; direct-to-Supabase uploads remove the upload-time memory spike.

## Manual checks

1. Payment-proof page: choose a valid receipt, submit, and confirm the user row stores the path and file name.
2. Signup as a paid delegate: upload payment proof and confirm the registration stores payment metadata.
3. Chair signup: upload a PDF/DOC/DOCX CV and confirm chair CV metadata is stored.
4. School delegation: upload the spreadsheet template and confirm the delegation row stores spreadsheet metadata.
5. Try oversized and mismatched-extension files for each purpose and confirm the browser/server reject them.
6. Open the homepage nationalities globe and confirm it loads, then refreshes only while visible.
7. Visit public pages/forms while logged out and confirm they load without redirects.
8. Log in to `/system` and confirm protected dashboard/session refresh still works.
