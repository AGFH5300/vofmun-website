import { cookies } from "next/headers"

import { SYSTEM_ADMIN_AUTH_COOKIE, verifySystemAdminToken } from "@/lib/auth/system-admin"
import { sendPaymentReminderAuditEmail, sendShortPaymentReminderEmail } from "@/lib/email/registration"
import { createClient } from "@/utils/supabase/server"

import { loadEligibleRecipients } from "../data"

type RequestPayload = {
  selectionMode?: "all" | "selected"
  recipientIds?: number[]
}

type StreamEvent =
  | { type: "start"; total: number; message: string }
  | {
      type: "progress"
      processed: number
      total: number
      sent: number
      failed: number
      skipped: number
      recipient: { name: string; email: string | null }
      status: "sent" | "failed" | "skipped"
      error?: string
    }
  | {
      type: "complete"
      status: "success" | "error"
      message: string
      sentCount: number
      failedEmails: string[]
    }

const parseAllowList = (value: string | undefined) =>
  (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)

async function hasSystemPortalAccess() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return false

  const allowedEmails = parseAllowList(process.env.SYSTEM_ADMIN_EMAILS)
  const userEmail = (user.email ?? "").toLowerCase()

  if (allowedEmails.length === 0) {
    return Boolean(userEmail)
  }

  return Boolean(userEmail) && allowedEmails.includes(userEmail)
}

const asNdjson = (event: StreamEvent) => `${JSON.stringify(event)}\n`

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return Response.json({ status: "error", message: "RESEND_API_KEY is not configured." }, { status: 500 })
  }

  const cookieStore = await cookies()
  const existingToken = cookieStore.get(SYSTEM_ADMIN_AUTH_COOKIE)?.value
  const verifiedToken = existingToken ? verifySystemAdminToken(existingToken) : null
  const hasPortalAccess = await hasSystemPortalAccess()

  if (!verifiedToken && !hasPortalAccess) {
    return Response.json({ status: "error", message: "Unauthorized request" }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as RequestPayload
  const selectionMode = body.selectionMode === "selected" ? "selected" : "all"
  const selectedIds = (body.recipientIds ?? []).filter((value): value is number => Number.isInteger(value))

  const stream = new ReadableStream({
    start: async (controller) => {
      const encoder = new TextEncoder()
      const write = (event: StreamEvent) => controller.enqueue(encoder.encode(asNdjson(event)))

      try {
        const supabase = await createClient()
        const recipients = await loadEligibleRecipients(supabase)
        const recipientsInScope =
          selectionMode === "selected"
            ? recipients.filter((record) => selectedIds.includes(record.id))
            : recipients

        const total = recipientsInScope.length
        const requestHeaders = request.headers
        const forwardedFor = requestHeaders.get("x-forwarded-for")
        const realIp = requestHeaders.get("x-real-ip")
        const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown"
        const deviceInfo = requestHeaders.get("user-agent") || "unknown"

        write({
          type: "start",
          total,
          message:
            total === 0
              ? "No unpaid delegates found to notify."
              : `Starting reminder delivery for ${total} delegate${total === 1 ? "" : "s"}.`,
        })

        if (total === 0) {
          write({
            type: "complete",
            status: "error",
            message: "No unpaid delegates found to notify.",
            sentCount: 0,
            failedEmails: [],
          })
          controller.close()
          return
        }

        let processed = 0
        let sent = 0
        let failed = 0
        let skipped = 0
        const failedEmails: string[] = []

        for (const record of recipientsInScope) {
          processed += 1

          if (!record.email) {
            skipped += 1
            write({
              type: "progress",
              processed,
              total,
              sent,
              failed,
              skipped,
              recipient: { name: record.name, email: null },
              status: "skipped",
              error: "Missing email",
            })
            continue
          }

          let status: "sent" | "failed" = "sent"
          let errorMessage: string | undefined

          try {
            await sendShortPaymentReminderEmail({
              firstName: record.firstName,
              lastName: record.lastName,
              email: record.email,
              role: "delegate",
            })
            sent += 1
          } catch (cause) {
            status = "failed"
            failed += 1
            errorMessage = cause instanceof Error ? cause.message : "Unknown email error"
            failedEmails.push(record.email)
            console.error("Failed to send reminder", { recordId: record.id, email: record.email, cause })
          }

          const nextCount = record.reminderCount + 1
          const recordedAt = new Date().toISOString()

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

          write({
            type: "progress",
            processed,
            total,
            sent,
            failed,
            skipped,
            recipient: { name: record.name, email: record.email },
            status,
            ...(errorMessage ? { error: errorMessage } : {}),
          })
        }

        try {
          await sendPaymentReminderAuditEmail({
            ipAddress,
            deviceInfo,
            actionType: "send",
            selectionMode,
            recipientsAttempted: total,
            remindersSent: sent,
            remindersFailed: failed,
          })
        } catch (cause) {
          console.error("Failed to send reminder audit email", { cause })
        }

        write({
          type: "complete",
          status: failed > 0 ? "error" : "success",
          message:
            failed > 0
              ? `Reminders finished with ${failed} failure${failed === 1 ? "" : "s"}.`
              : "Payment reminders sent successfully.",
          sentCount: sent,
          failedEmails,
        })
      } catch (cause) {
        write({
          type: "complete",
          status: "error",
          message: "Unexpected error while sending reminders.",
          sentCount: 0,
          failedEmails: [],
        })
        console.error("Payment reminder stream failed", { cause })
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
