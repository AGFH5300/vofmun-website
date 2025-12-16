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

The application now reads from and writes to these columns when sending or recording reminders.
