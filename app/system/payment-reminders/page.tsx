import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SYSTEM_ADMIN_AUTH_COOKIE, verifySystemAdminToken } from "@/lib/auth/system-admin"
import { sendShortPaymentReminderEmail } from "@/lib/email/registration"
import { createClient } from "@/utils/supabase/server"

import { PaymentReminderForm, type ReminderFormState } from "./reminder-form"
import { loadEligibleRecipients } from "./data"

const buildConfigError = (missingEnv: string[]) => (
  <main className="min-h-screen bg-[#ffecdd] text-slate-900">
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-xl rounded-xl border border-[#B22222]/30 bg-white p-8 text-center shadow-xl">
        <h1 className="mb-4 text-2xl font-serif font-semibold text-[#B22222]">Configuration required</h1>
        <p className="text-sm text-slate-600">
          Set the following environment variable{missingEnv.length > 1 ? "s" : ""} to enable this page:
        </p>
        <ul className="mt-4 flex list-inside list-disc flex-col gap-1 text-sm text-slate-700">
          {missingEnv.map((envVar) => (
            <li key={envVar}>
              <code className="rounded bg-slate-100 px-2 py-1 text-slate-900">{envVar}</code>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </main>
)

async function sendDelegateReminders(_: ReminderFormState, formData: FormData): Promise<ReminderFormState> {
  "use server"

  const actionType = formData.get("actionType")?.toString() === "record" ? "record" : "send"
  const manualReminderInput = formData.get("manualReminderAt")?.toString() ?? ""
  const parsedManualReminder = manualReminderInput ? new Date(manualReminderInput) : null
  const manualReminderTimestamp =
    actionType === "record" && parsedManualReminder && !Number.isNaN(parsedManualReminder.getTime())
      ? parsedManualReminder
      : null

  if (actionType === "send" && !process.env.RESEND_API_KEY) {
    return {
      status: "error",
      message: "RESEND_API_KEY is not configured; cannot send reminders.",
    }
  }

  const supabase = await createClient()
  const recipients = await loadEligibleRecipients(supabase)
  const selectedIds = formData.getAll("recipient").map((value) => Number(value)).filter(Boolean)
  const selectionMode = formData.get("selectionMode")?.toString() === "selected" ? "selected" : "all"

  const recipientsInScope =
    selectionMode === "selected"
      ? recipients.filter((record) => selectedIds.includes(record.id))
      : recipients

  const emailReadyRecipients = recipientsInScope.filter((record) => Boolean(record.email))
  const recipientsToNotify = actionType === "send" ? emailReadyRecipients : recipientsInScope

  if (recipientsToNotify.length === 0) {
    return {
      status: "idle",
      message:
        selectionMode === "selected"
          ? "Select at least one recipient to update."
          : actionType === "send"
            ? "No unpaid delegates with valid emails found to notify."
            : "No unpaid delegates found to update.",
    }
  }

  let failed = 0

  for (const record of recipientsToNotify) {
    try {
      if (actionType === "send") {
        await sendShortPaymentReminderEmail({
          firstName: record.firstName,
          lastName: record.lastName,
          email: record.email!,
          role: "delegate",
        })
      }

      const nextCount = record.reminderCount + 1
      const recordedAt = (manualReminderTimestamp ?? new Date()).toISOString()

      const { error: updateError } = await supabase
        .from("users")
        .update({
          payment_reminder_count: nextCount,
          payment_reminder_last_sent_at: recordedAt,
        })
        .eq("id", record.id)
        .select("id")

      if (updateError) {
        console.error("Failed to update reminder metadata", { recordId: record.id, updateError })
      }
    } catch (cause) {
      failed += 1
      console.error("Failed to send reminder", { recordId: record.id, cause })
    }
  }

  if (failed > 0) {
    return {
      status: "error",
      message: `Reminders sent with ${failed} failure${failed === 1 ? "" : "s"}.`,
      sentCount: recipientsToNotify.length - failed,
    }
  }

  const successMessage =
    actionType === "send"
      ? selectionMode === "selected"
        ? "Payment reminders sent to the selected delegates."
        : "Payment reminders sent to all unpaid delegates."
      : selectionMode === "selected"
        ? "Reminder history recorded for the selected delegates."
        : "Reminder history recorded for all unpaid delegates."

  return {
    status: "success",
    message: successMessage,
    sentCount: recipientsToNotify.length,
  }
}

export default async function PaymentRemindersPage() {
  const requiredPassword = process.env.SIGNUP_PORTAL_PASSWORD
  const authSecret = process.env.SYSTEM_AUTH_SECRET

  if (!requiredPassword || !authSecret) {
    const missingEnv = [
      !requiredPassword ? "SIGNUP_PORTAL_PASSWORD" : null,
      !authSecret ? "SYSTEM_AUTH_SECRET" : null,
    ].filter(Boolean) as string[]

    return buildConfigError(missingEnv)
  }

  const cookieStore = await cookies()
  const existingToken = cookieStore.get(SYSTEM_ADMIN_AUTH_COOKIE)?.value
  const verifiedToken = existingToken ? verifySystemAdminToken(existingToken) : null

  if (!verifiedToken) {
    redirect("/system")
  }

  const eligibleRecipients = await loadEligibleRecipients()
  const eligibleCount = eligibleRecipients.filter((recipient) => Boolean(recipient.email)).length

  return (
    <main className="min-h-screen bg-[#ffecdd] text-slate-900">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-[#B22222]">System tools</p>
            <h1 className="text-3xl font-serif font-semibold text-slate-900">Delegate payment reminders</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-700">
              Send a payment reminder email to all delegate registrations that do not have a payment recorded yet.
            </p>
          </div>
          <a
            href="/system"
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
          >
            Back to portal
          </a>
        </div>

        <div className="mx-auto">
          <PaymentReminderForm
            action={sendDelegateReminders}
            eligibleCount={eligibleCount}
            resendConfigured={Boolean(process.env.RESEND_API_KEY)}
            recipients={eligibleRecipients}
          />
        </div>
      </div>
    </main>
  )
}
