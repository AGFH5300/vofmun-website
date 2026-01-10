import { createClient } from "@/utils/supabase/server"

import type { EligibleRecipient } from "./types"

export type DelegateRecord = {
  id: number
  first_name: string | null
  last_name: string | null
  email: string | null
  payment_status: string | null
  payment_reminder_count: number | null
  payment_reminder_last_sent_at: string | null
}

export type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

export const mapToRecipient = (record: DelegateRecord): EligibleRecipient => {
  const reminderCount = typeof record.payment_reminder_count === "number" ? record.payment_reminder_count : 0
  const lastReminderAt = record.payment_reminder_last_sent_at

  return {
    id: record.id,
    name: [record.first_name, record.last_name].filter(Boolean).join(" ") || "Delegate",
    firstName: record.first_name,
    lastName: record.last_name,
    email: record.email,
    paymentStatus: record.payment_status,
    reminderCount,
    lastReminderAt,
  }
}

export async function loadEligibleRecipients(existingClient?: SupabaseServerClient): Promise<EligibleRecipient[]> {
  const supabase = existingClient ?? (await createClient())
  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, payment_status, payment_reminder_count, payment_reminder_last_sent_at")
    .eq("role", "delegate")
    .or("payment_status.is.null,payment_status.eq.unpaid,payment_status.eq.pending")

  if (error) {
    console.error("Failed to load delegate records for reminders", error)
    return []
  }

  return (data ?? []).map(mapToRecipient)
}

export async function getEligibleDelegateById(
  recipientId: number,
  existingClient?: SupabaseServerClient,
): Promise<DelegateRecord | null> {
  const supabase = existingClient ?? (await createClient())

  const { data, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, email, payment_status, payment_reminder_count, payment_reminder_last_sent_at")
    .eq("id", recipientId)
    .eq("role", "delegate")
    .or("payment_status.is.null,payment_status.eq.unpaid,payment_status.eq.pending")
    .maybeSingle()

  if (error) {
    console.error("Failed to load delegate record for reminder", { recipientId, error })
    return null
  }

  return data ?? null
}
