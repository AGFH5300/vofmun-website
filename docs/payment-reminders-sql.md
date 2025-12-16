# Payment reminder storage columns

Run the following SQL against your Supabase database to move reminder metadata out of the `delegate_data` JSON blob and into first-class columns on the `users` table:

```sql
ALTER TABLE users
ADD COLUMN payment_reminder_count integer DEFAULT 0 NOT NULL;

ALTER TABLE users
ADD COLUMN payment_reminder_last_sent_at timestamptz NULL;
```

If you have existing reminder information stored inside `delegate_data->paymentReminders`, you can migrate it into the new columns with:

```sql
UPDATE users
SET
  payment_reminder_count = COALESCE((delegate_data -> 'paymentReminders' ->> 'count')::integer, 0),
  payment_reminder_last_sent_at = NULLIF(delegate_data -> 'paymentReminders' ->> 'lastSentAt', '')::timestamptz
WHERE delegate_data ? 'paymentReminders';
```

## Manually record individual reminder sends

Use the CTE below to record the manual reminders you listed. It aggregates duplicates so that users with two entries have their reminder count incremented by 2 and their `payment_reminder_last_sent_at` set to the later timestamp. Adjust the `WHERE u.email = r.email` clause if your user identifier differs.

```sql
WITH raw_reminders AS (
  VALUES
    ('mo.ziad@gmail.com', '2025-12-11 10:14:45.675+00'::timestamptz),
    ('souparnikaranjith011@gmail.com', '2025-12-11 10:14:46.001+00'::timestamptz),
    ('rejepowa341@gmail.com', '2025-12-11 10:14:46.858+00'::timestamptz),
    ('yara1atiyeh@gmail.com', '2025-12-11 10:14:47.036+00'::timestamptz),
    ('julia.a.almsallakh@gmail.com', '2025-12-11 10:14:47.965+00'::timestamptz),
    ('fayrouzsaqr@icloud.com', '2025-12-11 10:14:48.263+00'::timestamptz),
    ('omar.s.elnakeeb@gmail.com', '2025-12-11 10:14:48.974+00'::timestamptz),
    ('zeinaymansaad4@icloud.com', '2025-12-11 10:14:49.214+00'::timestamptz),
    ('larahgzy10@gmail.com', '2025-12-11 10:14:50.121+00'::timestamptz),
    ('nadoosh11149@gmail.com', '2025-12-11 10:14:51.173+00'::timestamptz),
    ('eladlydalia@yahoo.com', '2025-12-11 10:14:51.72+00'::timestamptz),
    ('williamdiab2010@gmail.com', '2025-12-11 10:14:52.766+00'::timestamptz),
    ('safdarsoha@gmail.com', '2025-12-11 10:14:53.016+00'::timestamptz),
    ('josieavril.c_jcd@jumeirahcollege.com', '2025-12-11 10:14:53.722+00'::timestamptz),
    ('mo.ziad@gmail.com', '2025-12-14 10:56:02.74+00'::timestamptz),
    ('souparnikaranjith011@gmail.com', '2025-12-14 10:56:02.32+00'::timestamptz),
    ('malikasoliman2010@icloud.com', '2025-12-14 10:56:03.121+00'::timestamptz),
    ('manhaxpathan@gmail.com', '2025-12-14 10:56:03.306+00'::timestamptz),
    ('y7233951@gmail.com', '2025-12-14 10:56:04.291+00'::timestamptz),
    ('omar.s.elnakeeb@gmail.com', '2025-12-14 10:56:04.51+00'::timestamptz),
    ('esraersavasti@icloud.com', '2025-12-14 10:56:05.46+00'::timestamptz),
    ('aarush.mathuria@gmail.com', '2025-12-14 10:56:05.603+00'::timestamptz),
    ('safdarsoha@gmail.com', '2025-12-14 10:56:06.557+00'::timestamptz),
    ('ayatminhas26@gmail.com', '2025-12-14 10:56:07.407+00'::timestamptz)
), reminders AS (
  SELECT
    email,
    COUNT(*) AS reminder_count,
    MAX(sent_at) AS last_sent_at
  FROM (
    SELECT email, sent_at FROM raw_reminders
  ) t (email, sent_at)
  GROUP BY email
)
UPDATE users u
SET
  payment_reminder_count = COALESCE(u.payment_reminder_count, 0) + r.reminder_count,
  payment_reminder_last_sent_at = GREATEST(COALESCE(u.payment_reminder_last_sent_at, to_timestamp(0)), r.last_sent_at)
FROM reminders r
WHERE u.email = r.email;
```

This assumes the `users` table has an `email` column and that you want to increment existing counts rather than overwrite them. If you prefer to overwrite instead of incrementing, change the assignment for `payment_reminder_count` to `= r.reminder_count`.
