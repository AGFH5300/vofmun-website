// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { Resend } from "resend"

import {
  PAYMENT_DETAILS,
  renderPaymentDetailsHtml,
  renderPaymentDetailsText,
  renderStripeCtaHtml,
  renderStripeCtaText,
} from "@/lib/payment-details"

const resendApiKey = process.env.RESEND_API_KEY
const resendClient = resendApiKey ? new Resend(resendApiKey) : null
const FROM_EMAIL = "no-reply@vofmun.org"
const RESEND_RATE_LIMIT_MS = 550
const MAX_RATE_LIMIT_RETRIES = 4

let emailSendQueue: Promise<void> = Promise.resolve()
let lastEmailSentAt = 0

const baseBodyStyle =
  "font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; line-height: 1.7; font-size: 15px;"

const summaryListStyle =
  "list-style: none; padding: 0; margin: 0; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;"

type ChairAdminEmailMode = "paid" | "unpaid"

function formatFullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .trim()
}

function greetingName(firstName?: string | null, lastName?: string | null) {
  const fullName = formatFullName(firstName, lastName)
  return fullName.length > 0 ? fullName : "there"
}

type RegistrationEmailPayload = {
  firstName?: string | null
  lastName?: string | null
  email: string
  role: "delegate" | "chair" | "admin"
}

type PaymentReminderAuditPayload = {
  ipAddress: string
  deviceInfo: string
  actionType: "send" | "record"
  selectionMode: "all" | "selected"
  recipientsAttempted: number
  remindersSent: number
  remindersFailed: number
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function isRateLimitError(message: string) {
  const normalized = message.toLowerCase()
  return normalized.includes("too many requests") || normalized.includes("rate limit")
}

async function withEmailSendQueue<T>(task: () => Promise<T>): Promise<T> {
  const previousTask = emailSendQueue
  let releaseQueue!: () => void

  emailSendQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve
  })

  await previousTask

  try {
    const now = Date.now()
    const waitMs = Math.max(0, RESEND_RATE_LIMIT_MS - (now - lastEmailSentAt))
    if (waitMs > 0) {
      await sleep(waitMs)
    }

    const result = await task()
    lastEmailSentAt = Date.now()
    return result
  } finally {
    releaseQueue()
  }
}

type SendEmailArgs = Parameters<NonNullable<typeof resendClient>["emails"]["send"]>[0]

type EmailLogContext = {
  category:
    | "payment-confirmed"
    | "payment-reminder"
    | "payment-reminder-short"
    | "payment-reminder-audit"
    | "delegate-referral-code"
  recipient: string
}

async function sendEmailAndLog(args: SendEmailArgs, context: EmailLogContext) {
  try {
    const response = await sendEmailWithRateLimitHandling(args)

    if (response.error) {
      throw new Error(response.error.message || "Unknown email provider error")
    }

    console.info("[email] Sent", {
      category: context.category,
      recipient: context.recipient,
      subject: args.subject,
      messageId: response.data?.id ?? null,
    })

    return response
  } catch (error) {
    console.error("[email] Failed", {
      category: context.category,
      recipient: context.recipient,
      subject: args.subject,
      error,
    })
    throw error
  }
}

async function sendEmailWithRateLimitHandling(args: SendEmailArgs) {
  if (!resendClient) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  return withEmailSendQueue(async () => {
    let attempt = 0

    while (attempt <= MAX_RATE_LIMIT_RETRIES) {
      const response = await resendClient.emails.send(args)

      if (!response.error) {
        return response
      }

      const errorMessage = response.error.message || "Unknown email provider error"

      if (!isRateLimitError(errorMessage) || attempt === MAX_RATE_LIMIT_RETRIES) {
        throw new Error(errorMessage)
      }

      const retryDelayMs = RESEND_RATE_LIMIT_MS * (attempt + 1)
      await sleep(retryDelayMs)
      attempt += 1
    }

    throw new Error("Exceeded retry attempts while sending email")
  })
}

const buildChairAdminEmailContent = (
  payload: RegistrationEmailPayload,
  mode: ChairAdminEmailMode,
): { subject: string; html: string; text: string } => {
  const nameForGreeting = greetingName(payload.firstName, payload.lastName)
  const roleLabel = payload.role === "chair" ? "Chair" : "Admin"

  const html = `
    <div style="${baseBodyStyle}">
      <p>Hi ${nameForGreeting},</p>
      <p>Thanks for applying to be a ${roleLabel.toLowerCase()} at <strong>VOFMUN I 2026</strong>!</p>
      <p>
        We will get in touch with all candidates once the application deadline has elapsed to share your application status.
        ${payload.role === "chair"
          ? "All shortlisted chairing applicants will move on to the interview stage to select the final chairs for VOFMUN I 2026."
          : "Admins will be contacted soon after the deadline regarding whether they have been selected."}
      </p>
      <p>We wish you the best of luck on your application.</p>
      <p style="margin-top: 12px;">If you are selected, we will share the onboarding details and payment instructions with you directly.</p>
      <p style="margin-top: 24px;">Thanks for applying!<br/>VOFMUN I 2026 Secretariat</p>
    </div>
  `

  const text = `Hi ${nameForGreeting},\n\nThanks for applying to be a ${roleLabel.toLowerCase()} at VOFMUN I 2026!\n\nWe will get in touch with all candidates once the application deadline has elapsed to share your application status. ${
    payload.role === "chair"
      ? "All shortlisted chairing applicants will move on to the interview stage to select the final chairs for VOFMUN I 2026."
      : "Admins will be contacted soon after the deadline regarding whether they have been selected."
  }\n\nWe wish you the best of luck on your application.\n\nIf you are selected, we will share onboarding details and payment instructions with you directly.\n\nThanks for applying!\nVOFMUN I 2026 Secretariat`

  return {
    subject: `VOFMUN ${roleLabel} application received`,
    html,
    text,
  }
}

export async function sendPaymentConfirmedEmail(
  payload: RegistrationEmailPayload & { paymentProofFileName?: string | null }
) {
  if (!resendClient) {
    console.warn("Resend API key not configured; skipping payment confirmation email")
    return
  }

  if (payload.role === "chair" || payload.role === "admin") {
    const content = buildChairAdminEmailContent(payload, "paid")

    await sendEmailAndLog({
      from: FROM_EMAIL,
      to: payload.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    }, { category: "payment-confirmed", recipient: payload.email })
    return
  }

  const nameForGreeting = greetingName(payload.firstName, payload.lastName)
  const fullName = formatFullName(payload.firstName, payload.lastName) || "your registration"

  const html = `
    <div style="${baseBodyStyle}">
      <p>Hi ${nameForGreeting},</p>
      <p>
        Thank you for registering for <strong>VOFMUN 2026</strong>. We have received your application as a
        <strong>${payload.role.charAt(0).toUpperCase() + payload.role.slice(1)}</strong> and your proof of payment.
        Our finance team will verify the transfer shortly and send your official confirmation with next steps.
      </p>
      <p style="margin-top: 24px; font-weight: 600; color: #0f172a;">Registration summary</p>
      <ul style="${summaryListStyle}">
        <li style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Full name: ${fullName}</li>
        <li style="padding: 12px 16px;">Role: ${payload.role}</li>
      </ul>
      <p style="margin-top: 24px;">We'll be in touch soon with conference logistics, committee assignments, and travel information.</p>
      <p style="margin-top: 24px;">Warm regards,<br/>VOFMUN Secretariat</p>
    </div>
  `

  const text = `Hi ${nameForGreeting},\n\nThank you for registering for VOFMUN 2026. We received your ${payload.role} application and your proof of payment.\n\nRegistration summary:\n- Full name: ${fullName}\n- Role: ${payload.role}\n\nWe'll be in touch soon with next steps.\n\nVOFMUN Secretariat`

  await sendEmailAndLog({
    from: FROM_EMAIL,
    to: payload.email,
    subject: "VOFMUN registration & payment received",
    html,
    text,
  }, { category: "payment-confirmed", recipient: payload.email })
}

export async function sendPaymentReminderEmail(payload: RegistrationEmailPayload) {
  if (!resendClient) {
    console.warn("Resend API key not configured; skipping payment reminder email")
    return
  }

  if (payload.role === "chair" || payload.role === "admin") {
    const content = buildChairAdminEmailContent(payload, "unpaid")

    await sendEmailAndLog({
      from: FROM_EMAIL,
      to: payload.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    }, { category: "payment-reminder", recipient: payload.email })
    return
  }

  const nameForGreeting = greetingName(payload.firstName, payload.lastName)
  const proofLink = PAYMENT_DETAILS.proofUploadUrl

  const html = `
    <div style="${baseBodyStyle}">
      <p>Hi ${nameForGreeting},</p>
      <p>
        Thank you for submitting your <strong>${payload.role}</strong> application for VOFMUN 2026! You let us know that you
        still need to complete payment, so we've included all of the bank transfer details below. Once you pay, please upload
        your proof of payment so we can activate your registration.
      </p>
      ${renderStripeCtaHtml()}
      <p style="margin-top: 24px; font-weight: 600; color: #0f172a;">How to complete your payment</p>
      ${renderPaymentDetailsHtml()}
      <p style="margin-top: 24px;">Upload your transfer receipt or screenshot here:</p>
      <p>
        <a
          href="${proofLink}"
          style="display: inline-flex; align-items: center; gap: 8px; background: #B22222; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 600;"
        >
          Upload proof of payment
        </a>
      </p>
      <p style="margin-top: 24px;">If you've already paid, simply share the receipt via the link above and we'll mark your payment as received.</p>
      <p style="margin-top: 24px;">We're excited to welcome you to VOFMUN 2026!</p>
      <p style="margin-top: 24px;">Warm regards,<br/>VOFMUN Secretariat</p>
    </div>
  `

  const text = `Hi ${nameForGreeting},\n\nThanks for registering for VOFMUN 2026 as a ${payload.role}! You mentioned you still need to pay.\n${renderStripeCtaText() ? `\n${renderStripeCtaText()}\n` : ""}\n${renderPaymentDetailsText()}\n\nUpload proof: ${proofLink}\n\nIf you've already completed the transfer, send us the receipt using the link above so we can confirm it.\n\nVOFMUN Secretariat`

  await sendEmailAndLog({
    from: FROM_EMAIL,
    to: payload.email,
    subject: "Complete your VOFMUN payment",
    html,
    text,
  }, { category: "payment-reminder", recipient: payload.email })
}

export async function sendDelegateReferralCodeEmail(payload: {
  email: string
  firstName?: string | null
  lastName?: string | null
  referralCode: string
}) {
  if (!resendClient) {
    console.warn("Resend API key not configured; skipping delegate referral code email")
    return
  }

  const nameForGreeting = greetingName(payload.firstName, payload.lastName)
  const normalizedCode = payload.referralCode.trim().toUpperCase()

  const html = `
    <div style="${baseBodyStyle}">
      <p>Hi ${nameForGreeting},</p>
      <p>Here is your personal VOFMUN delegate referral code:</p>
      <p style="font-size: 28px; font-weight: 700; letter-spacing: 0.12em; color: #0f172a; margin: 16px 0;">${normalizedCode}</p>
      <p>
        You can share or use this referral code during VOFMUN delegate registrations where referral codes are accepted.
      </p>
      <p style="margin-top: 24px;">Warm regards,<br/>VOFMUN Secretariat</p>
    </div>
  `

  const text = `Hi ${nameForGreeting},\n\nHere is your personal VOFMUN delegate referral code:\n\n${normalizedCode}\n\nYou can share or use this referral code during VOFMUN delegate registrations where referral codes are accepted.\n\nWarm regards,\nVOFMUN Secretariat`

  await sendEmailAndLog(
    {
      from: FROM_EMAIL,
      to: payload.email,
      subject: "Your VOFMUN Delegate Referral Code",
      html,
      text,
    },
    {
      category: "delegate-referral-code",
      recipient: payload.email,
    },
  )
}

export async function sendShortPaymentReminderEmail(payload: RegistrationEmailPayload) {
  if (!resendClient) {
    console.warn("Resend API key not configured; skipping short payment reminder email")
    return
  }

  if (payload.role === "chair" || payload.role === "admin") {
    const content = buildChairAdminEmailContent(payload, "unpaid")

    const response = await sendEmailAndLog({
      from: FROM_EMAIL,
      to: payload.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    }, { category: "payment-reminder-short", recipient: payload.email })

    if (response.error) {
      throw new Error(`Failed to send reminder email: ${response.error.message}`)
    }

    return
  }

  const nameForGreeting = greetingName(payload.firstName, payload.lastName)
  const proofLink = PAYMENT_DETAILS.proofUploadUrl

  const html = `
    <div style="${baseBodyStyle}">
      <p>Hi ${nameForGreeting},</p>
      <p>
        This is a quick reminder to complete your payment for VOFMUN 2026 so we can confirm your delegate spot.
      </p>
      ${renderStripeCtaHtml()}
      ${renderPaymentDetailsHtml()}
      <p style="margin-top: 24px;">Upload your transfer receipt or screenshot here:</p>
      <p>
        <a
          href="${proofLink}"
          style="display: inline-flex; align-items: center; gap: 8px; background: #B22222; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 600;"
        >
          Upload proof of payment
        </a>
      </p>
      <p style="margin-top: 24px;">If you’ve already paid, you can ignore this message.</p>
      <p style="margin-top: 24px;">Warm regards,<br/>VOFMUN Secretariat</p>
    </div>
  `

  const text = `Hi ${nameForGreeting},\n\nThis is a quick reminder to complete your payment for VOFMUN 2026 so we can confirm your delegate spot.\n${
    renderStripeCtaText() ? `\n${renderStripeCtaText()}\n` : ""
  }\n${renderPaymentDetailsText()}\n\nUpload proof: ${proofLink}\n\nIf you’ve already paid, you can ignore this message.\nWarm regards,\nVOFMUN Secretariat`

  const response = await sendEmailAndLog({
    from: FROM_EMAIL,
    to: payload.email,
    subject: "Quick reminder: complete your VOFMUN payment",
    html,
    text,
  }, { category: "payment-reminder-short", recipient: payload.email })

  if (response.error) {
    throw new Error(`Failed to send reminder email: ${response.error.message}`)
  }
}

export async function sendPaymentReminderAuditEmail(payload: PaymentReminderAuditPayload) {
  if (!resendClient) {
    console.warn("Resend API key not configured; skipping payment reminder audit email")
    return
  }

  const html = `
    <div style="${baseBodyStyle}">
      <p>A payment reminder action was performed from the system portal.</p>
      <ul style="${summaryListStyle}">
        <li style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Action type: ${payload.actionType}</li>
        <li style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Selection mode: ${payload.selectionMode}</li>
        <li style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">IP address: ${payload.ipAddress}</li>
        <li style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Device/User-Agent: ${payload.deviceInfo}</li>
        <li style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Recipients attempted: ${payload.recipientsAttempted}</li>
        <li style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb;">Reminders sent: ${payload.remindersSent}</li>
        <li style="padding: 12px 16px;">Reminders failed: ${payload.remindersFailed}</li>
      </ul>
    </div>
  `

  const text = `Payment reminder action detected.\n\nAction type: ${payload.actionType}\nSelection mode: ${payload.selectionMode}\nIP address: ${payload.ipAddress}\nDevice/User-Agent: ${payload.deviceInfo}\nRecipients attempted: ${payload.recipientsAttempted}\nReminders sent: ${payload.remindersSent}\nReminders failed: ${payload.remindersFailed}`

  const response = await sendEmailAndLog({
    from: FROM_EMAIL,
    to: "dxb.avg@gmail.com",
    subject: "VOFMUN payment reminder activity log",
    html,
    text,
  }, { category: "payment-reminder-audit", recipient: "dxb.avg@gmail.com" })

  if (response.error) {
    throw new Error(`Failed to send payment reminder audit email: ${response.error.message}`)
  }
}
