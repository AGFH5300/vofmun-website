import { Resend } from "resend"

import { PAYMENT_DETAILS, renderPaymentDetailsHtml, renderPaymentDetailsText } from "@/lib/payment-details"

const resendApiKey = process.env.RESEND_API_KEY
const resendClient = resendApiKey ? new Resend(resendApiKey) : null
const FROM_EMAIL = "no-reply@vofmun.org"

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

    await resendClient.emails.send({
      from: FROM_EMAIL,
      to: payload.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    })
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

  await resendClient.emails.send({
    from: FROM_EMAIL,
    to: payload.email,
    subject: "VOFMUN registration & payment received",
    html,
    text,
  })
}

export async function sendPaymentReminderEmail(payload: RegistrationEmailPayload) {
  if (!resendClient) {
    console.warn("Resend API key not configured; skipping payment reminder email")
    return
  }

  if (payload.role === "chair" || payload.role === "admin") {
    const content = buildChairAdminEmailContent(payload, "unpaid")

    await resendClient.emails.send({
      from: FROM_EMAIL,
      to: payload.email,
      subject: content.subject,
      html: content.html,
      text: content.text,
    })
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

  const text = `Hi ${nameForGreeting},\n\nThanks for registering for VOFMUN 2026 as a ${payload.role}! You mentioned you still need to pay.\n\n${renderPaymentDetailsText()}\n\nUpload proof: ${proofLink}\n\nIf you've already completed the transfer, send us the receipt using the link above so we can confirm it.\n\nVOFMUN Secretariat`

  await resendClient.emails.send({
    from: FROM_EMAIL,
    to: payload.email,
    subject: "Complete your VOFMUN payment",
    html,
    text,
  })
}
