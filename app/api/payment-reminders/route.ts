import { NextRequest, NextResponse } from "next/server"

import { sendShortPaymentReminderEmail } from "@/lib/email/registration"
import { createClient } from "@/utils/supabase/server"
import { loadEligibleRecipients } from "@/app/system/payment-reminders/data"

export const runtime = "nodejs"

const BATCH_SIZE = 25
const BATCH_DELAY_MS = 250

const getAuthSecret = () => process.env.SYSTEM_AUTH_SECRET ?? ""

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization") ?? ""
  const token = authHeader.replace("Bearer", "").trim()
  const secret = getAuthSecret()

  if (!secret || token !== secret) {
    return NextResponse.json(
      { message: "Unauthorized request", status: "error" },
      { status: 401 },
    )
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { message: "RESEND_API_KEY is not configured.", status: "error" },
      { status: 500 },
    )
  }

  const supabase = await createClient()
  const recipients = await loadEligibleRecipients(supabase)
  const nowIso = new Date().toISOString()

  const report = {
    totalCandidates: recipients.length,
    totalAttempted: 0,
    successCount: 0,
    failureCount: 0,
    results: [] as {
      id: number
      email: string | null
      status: "sent" | "failed" | "skipped"
      error?: string
    }[],
  }

  for (let start = 0; start < recipients.length; start += BATCH_SIZE) {
    const batch = recipients.slice(start, start + BATCH_SIZE)

    for (const recipient of batch) {
      if (!recipient.email) {
        report.results.push({
          id: recipient.id,
          email: recipient.email ?? null,
          status: "skipped",
          error: "Missing email address.",
        })
        continue
      }

      report.totalAttempted += 1

      let status: "sent" | "failed" = "sent"
      let errorMessage: string | undefined

      try {
        await sendShortPaymentReminderEmail({
          firstName: recipient.firstName,
          lastName: recipient.lastName,
          email: recipient.email,
          role: "delegate",
        })
        report.successCount += 1
      } catch (error) {
        status = "failed"
        report.failureCount += 1
        errorMessage = error instanceof Error ? error.message : "Unknown Resend error"
        console.error("Payment reminder send failed", {
          recordId: recipient.id,
          email: recipient.email,
          error,
        })
      }

      const nextCount = recipient.reminderCount + 1

      const { error: updateError } = await supabase
        .from("users")
        .update({
          payment_reminder_count: nextCount,
          payment_reminder_last_sent_at: nowIso,
        })
        .eq("id", recipient.id)
        .select("id")

      if (updateError) {
        console.error("Failed to update reminder metadata", {
          recordId: recipient.id,
          error: updateError,
        })
      }

      report.results.push({
        id: recipient.id,
        email: recipient.email,
        status,
        ...(errorMessage ? { error: errorMessage } : {}),
      })
    }

    if (start + BATCH_SIZE < recipients.length) {
      await wait(BATCH_DELAY_MS)
    }
  }

  return NextResponse.json(
    {
      status: "success",
      ...report,
    },
    { status: 200 },
  )
}
