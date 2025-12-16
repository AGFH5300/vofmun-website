import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { SYSTEM_ADMIN_AUTH_COOKIE, verifySystemAdminToken } from "@/lib/auth/system-admin"
import { sendShortPaymentReminderEmail } from "@/lib/email/registration"
import { createClient } from "@/utils/supabase/server"

import { getEligibleDelegateById } from "@/app/system/payment-reminders/data"

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured." }, { status: 400 })
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(SYSTEM_ADMIN_AUTH_COOKIE)?.value
  const verifiedToken = token ? verifySystemAdminToken(token) : null

  if (!verifiedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const recipientId = typeof body?.recipientId === "number" ? body.recipientId : Number(body?.recipientId)

  if (!recipientId || Number.isNaN(recipientId)) {
    return NextResponse.json({ error: "A valid recipientId is required." }, { status: 400 })
  }

  const supabase = await createClient()
  const delegateRecord = await getEligibleDelegateById(recipientId, supabase)

  if (!delegateRecord) {
    return NextResponse.json({ error: "Delegate not eligible for reminders." }, { status: 404 })
  }

  if (!delegateRecord.email) {
    return NextResponse.json({ error: "Delegate email address is missing." }, { status: 400 })
  }

  await sendShortPaymentReminderEmail({
    firstName: delegateRecord.first_name,
    lastName: delegateRecord.last_name,
    email: delegateRecord.email,
    role: "delegate",
  })

  const nextCount = (delegateRecord.payment_reminder_count ?? 0) + 1
  const recordedAt = new Date().toISOString()

  const { error: updateError } = await supabase
    .from("users")
    .update({
      payment_reminder_count: nextCount,
      payment_reminder_last_sent_at: recordedAt,
    })
    .eq("id", delegateRecord.id)
    .select("id")
    .single()

  if (updateError) {
    console.error("Failed to update reminder metadata", { recordId: delegateRecord.id, updateError })
    return NextResponse.json({ error: "Reminder sent but metadata could not be updated." }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    reminderCount: nextCount,
    recordedAt,
  })
}
