// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { Resend } from "resend";

import {
  HAS_STRIPE_PAYMENT_LINK,
  PAYMENT_DETAILS,
  PAYMENT_DETAILS_ENTRIES,
  STRIPE_PAYMENT_URL,
  renderPaymentDetailsText,
} from "@/lib/payment-details";

const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;
const FROM_EMAIL = "no-reply@vofmun.org";
const RESEND_RATE_LIMIT_MS = 550;
const MAX_RATE_LIMIT_RETRIES = 4;
const PAYMENT_PAGE_URL = "https://vofmun.org/signup#payment";

let emailSendQueue: Promise<void> = Promise.resolve();
let lastEmailSentAt = 0;

const EMAIL_FONT =
  "Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif";

const EMAIL_COLORS = {
  bg: "#f7f5ef",
  card: "#ffffff",
  border: "#eadfce",
  primary: "#701e1e",
  primarySoft: "#fff7ea",
  primarySoftText: "#7a4a00",
  text: "#1f2a2f",
  muted: "#52636a",
  link: "#0f4c5c",
  footer: "#8c8c8c",
};

type ChairAdminEmailMode = "paid" | "unpaid";

function formatFullName(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join(" ")
    .trim();
}

function greetingName(firstName?: string | null, lastName?: string | null) {
  const fullName = formatFullName(firstName, lastName);
  return fullName.length > 0 ? fullName : "there";
}

type RegistrationEmailPayload = {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
  role: "delegate" | "chair" | "admin";
};

type PaymentReminderAuditPayload = {
  ipAddress: string;
  deviceInfo: string;
  actionType: "send" | "record";
  selectionMode: "all" | "selected";
  recipientsAttempted: number;
  remindersSent: number;
  remindersFailed: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isRateLimitError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes("too many requests") ||
    normalized.includes("rate limit")
  );
}

async function withEmailSendQueue<T>(task: () => Promise<T>): Promise<T> {
  const previousTask = emailSendQueue;
  let releaseQueue!: () => void;

  emailSendQueue = new Promise<void>((resolve) => {
    releaseQueue = resolve;
  });

  await previousTask;

  try {
    const now = Date.now();
    const waitMs = Math.max(0, RESEND_RATE_LIMIT_MS - (now - lastEmailSentAt));
    if (waitMs > 0) await sleep(waitMs);

    const result = await task();
    lastEmailSentAt = Date.now();
    return result;
  } finally {
    releaseQueue();
  }
}

type SendEmailArgs = Parameters<
  NonNullable<typeof resendClient>["emails"]["send"]
>[0];

type EmailLogContext = {
  category:
    | "payment-confirmed"
    | "payment-reminder"
    | "payment-reminder-short"
    | "payment-reminder-audit"
    | "delegate-referral-code";
  recipient: string;
};

async function sendEmailAndLog(args: SendEmailArgs, context: EmailLogContext) {
  try {
    const response = await sendEmailWithRateLimitHandling(args);

    if (response.error) {
      throw new Error(response.error.message || "Unknown email provider error");
    }

    console.info("[email] Sent", {
      category: context.category,
      recipient: context.recipient,
      subject: args.subject,
      messageId: response.data?.id ?? null,
    });

    return response;
  } catch (error) {
    console.error("[email] Failed", {
      category: context.category,
      recipient: context.recipient,
      subject: args.subject,
      error,
    });
    throw error;
  }
}

async function sendEmailWithRateLimitHandling(args: SendEmailArgs) {
  if (!resendClient) throw new Error("RESEND_API_KEY is not configured");

  return withEmailSendQueue(async () => {
    let attempt = 0;

    while (attempt <= MAX_RATE_LIMIT_RETRIES) {
      const response = await resendClient.emails.send(args);

      if (!response.error) return response;

      const errorMessage =
        response.error.message || "Unknown email provider error";

      if (
        !isRateLimitError(errorMessage) ||
        attempt === MAX_RATE_LIMIT_RETRIES
      ) {
        throw new Error(errorMessage);
      }

      const retryDelayMs = RESEND_RATE_LIMIT_MS * (attempt + 1);
      await sleep(retryDelayMs);
      attempt += 1;
    }

    throw new Error("Exceeded retry attempts while sending email");
  });
}

/* ---------------- Email HTML helpers ---------------- */

function escapeHtml(value: string) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderButton(label: string, href: string, opts?: { bg?: string }) {
  const bg = opts?.bg ?? EMAIL_COLORS.primary;
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
      <tr>
        <td style="background:${bg};border-radius:12px;">
          <a href="${escapeHtml(href)}"
             style="display:inline-block;padding:12px 16px;color:#fff;text-decoration:none;font-weight:800;font-size:14px;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function renderInfoCard(rows: Array<{ label: string; value: string }>) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="border:1px solid ${EMAIL_COLORS.border};border-radius:14px;overflow:hidden;background:#fcfbf8;margin:14px 0 18px;">
      ${rows
        .map(
          (row, index) => `
            <tr>
              <td style="padding:12px 16px;${index < rows.length - 1 ? `border-bottom:1px solid ${EMAIL_COLORS.border};` : ""}">
                <div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:${EMAIL_COLORS.muted};margin-bottom:6px;">
                  ${escapeHtml(row.label)}
                </div>
                <div style="font-size:15px;line-height:1.5;color:${EMAIL_COLORS.text};word-break:break-word;">
                  ${escapeHtml(row.value)}
                </div>
              </td>
            </tr>
          `,
        )
        .join("")}
    </table>
  `;
}

function renderPaymentDetailsCardHtml() {
  const rows = (PAYMENT_DETAILS_ENTRIES ?? []).map((e) => ({
    label: e.label,
    value: e.value,
  }));

  const ref = PAYMENT_DETAILS?.paymentReference;
  if (ref && !rows.some((r) => r.label.toLowerCase().includes("reference"))) {
    rows.push({ label: "Payment reference", value: ref });
  }

  return renderInfoCard(rows);
}

/**
 * NEW: email-safe “Stripe box” that matches your preview style.
 * (Uses simple HTML badges instead of JS/copy logic.)
 */
function renderStripeBoxHtml() {
  if (!HAS_STRIPE_PAYMENT_LINK || !STRIPE_PAYMENT_URL) return "";

  const badge = (text: string, opts?: { dark?: boolean }) => {
    const dark = opts?.dark ?? false;
    const bg = dark ? "#000" : "#fff";
    const border = dark ? "#000" : "#d8d7f7";
    const color = dark ? "#fff" : "#111827";
    return `<span style="display:inline-block;padding:7px 10px;border-radius:10px;background:${bg};border:1px solid ${border};font-size:12px;font-weight:800;color:${color};line-height:1;white-space:nowrap;">${escapeHtml(
      text,
    )}</span>`;
  };

  return `
    <div style="border:1px solid #e3ddff;background:#f4f2ff;border-radius:16px;padding:16px;margin:0 0 18px;">
      <div style="font-size:16px;font-weight:900;color:#362f78;margin:0 0 6px;">
        Pay instantly with Stripe
      </div>

      <div style="font-size:14px;line-height:1.55;color:#362f78;margin:0 0 12px;">
        Use Apple Pay, Google Pay, or your credit / debit card for the fastest checkout option.
      </div>

      <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;border-spacing:6px 0;margin:0 0 14px;">
        <tr>
          <td valign="middle" style="background:#ffffff;border:1px solid #cfcfd4;border-radius:10px;padding:5px 9px;height:34px;">
            <img
              src="https://cdn.jsdelivr.net/gh/AGFH5300/vofmun-website@main/public/payment/visa-logo.png"
              alt="Visa"
              style="display:block;border:0;outline:none;text-decoration:none;height:18px;width:auto;"
            />
          </td>

          <td valign="middle" style="background:#2d2d35;border-radius:10px;padding:5px 9px;height:34px;">
            <img
              src="https://cdn.jsdelivr.net/gh/AGFH5300/vofmun-website@main/public/payment/mastercard-logo.png"
              alt="Mastercard"
              style="display:block;border:0;outline:none;text-decoration:none;height:18px;width:auto;"
            />
          </td>

          <td valign="middle" style="background:#ffffff;border:1px solid #d9d9de;border-radius:10px;padding:5px 10px;height:34px;">
            <img
              src="https://cdn.jsdelivr.net/gh/AGFH5300/vofmun-website@main/public/payment/applepay-logo.png"
              alt="Apple Pay"
              style="display:block;border:0;outline:none;text-decoration:none;height:18px;width:auto;"
            />
          </td>

          <td valign="middle" style="background:#ffffff;border:1px solid #d9d9de;border-radius:10px;padding:5px 10px;height:34px;">
            <img
              src="https://cdn.jsdelivr.net/gh/AGFH5300/vofmun-website@main/public/payment/googlepay-logo.png"
              alt="Google Pay"
              style="display:block;border:0;outline:none;text-decoration:none;height:18px;width:auto;"
            />
          </td>
        </tr>
      </table>

      ${renderButton("Pay now via Stripe →", STRIPE_PAYMENT_URL, { bg: "#635bff" })}

      <div style="margin:0;font-size:12px;color:${EMAIL_COLORS.muted};line-height:1.5;">
        Or use the bank transfer details below if you prefer to pay manually.
      </div>
    </div>
  `;
}

function renderEmailFrame(args: {
  title: string;
  recipientEmail: string;
  preheader?: string;
  contentHtml: string;
}) {
  const preheader = args.preheader?.trim() || args.title;

  return `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${escapeHtml(preheader)}
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
           style="background:${EMAIL_COLORS.bg};padding:24px 0;font-family:${EMAIL_FONT};">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" width="600"
                 style="max-width:600px;background:${EMAIL_COLORS.card};border:1px solid ${EMAIL_COLORS.border};border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:${EMAIL_COLORS.primary};padding:18px 22px;">
                <div style="color:#fff;font-size:18px;font-weight:900;margin-top:6px;">
                  ${escapeHtml(args.title)}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:22px;color:${EMAIL_COLORS.text};font-size:15px;line-height:1.6;">
                ${args.contentHtml}
              </td>
            </tr>

            <tr>
              <td style="background:${EMAIL_COLORS.primarySoft};border-top:1px solid ${EMAIL_COLORS.border};padding:14px 22px;">
                <p style="margin:0;color:${EMAIL_COLORS.primarySoftText};font-size:12px;line-height:1.55;">
                  Need help? Contact us at
                  <a href="mailto:conference@vofmun.org"
                     style="font-weight:700;color:#B22222;text-underline-offset:4px;text-decoration:none;">
                    conference@vofmun.org
                  </a>
                </p>
              </td>
            </tr>
          </table>

          <div style="max-width:600px;color:${EMAIL_COLORS.footer};font-size:11px;line-height:1.5;margin-top:10px;font-family:${EMAIL_FONT};">
            © VOFMUN 2026 • This message was sent to ${escapeHtml(args.recipientEmail)}
          </div>
        </td>
      </tr>
    </table>
  `;
}

/* ---------------- Chair/Admin application email ---------------- */

const buildChairAdminEmailContent = (
  payload: RegistrationEmailPayload,
  _mode: ChairAdminEmailMode,
): { subject: string; html: string; text: string } => {
  const nameForGreeting = greetingName(payload.firstName, payload.lastName);
  const roleLabel = payload.role === "chair" ? "Chair" : "Admin";

  const html = renderEmailFrame({
    title: `${roleLabel} application received`,
    recipientEmail: payload.email,
    preheader: `Your VOFMUN ${roleLabel.toLowerCase()} application has been received.`,
    contentHtml: `
      <p style="margin:0 0 12px;">Hi ${escapeHtml(nameForGreeting)},</p>

      <p style="margin:0 0 12px;">
        Thank you for applying to be a <strong>${roleLabel.toLowerCase()}</strong> at <strong>VOFMUN I 2026</strong>.
      </p>

      <p style="margin:0 0 12px;">
        We have received your application and it is now under review.
      </p>

      <p style="margin:0 0 18px;">
        We will contact all applicants after the application deadline with an update on their status.
        ${
          payload.role === "chair"
            ? "Shortlisted chair applicants will be invited to the interview stage before final selections are made."
            : "Selected admins will be contacted directly with the next steps."
        }
      </p>

      <div style="border-top:1px solid ${EMAIL_COLORS.border};padding-top:14px;">
        <p style="margin:0;color:${EMAIL_COLORS.muted};font-size:13px;line-height:1.55;">
          If you are selected, we will share onboarding details and any relevant payment information with you directly.
        </p>
      </div>
    `,
  });

  const text = `Hi ${nameForGreeting},

Thank you for applying to be a ${roleLabel.toLowerCase()} at VOFMUN I 2026.

We have received your application and it is now under review.

We will contact all applicants after the application deadline with an update on their status. ${
    payload.role === "chair"
      ? "Shortlisted chair applicants will be invited to the interview stage before final selections are made."
      : "Selected admins will be contacted directly with the next steps."
  }

If you are selected, we will share onboarding details and any relevant payment information with you directly.

VOFMUN I 2026 Secretariat`;

  return {
    subject: `Your VOFMUN ${roleLabel} application has been received`,
    html,
    text,
  };
};

/* ---------------- Public exports ---------------- */

export async function sendPaymentConfirmedEmail(
  payload: RegistrationEmailPayload & { paymentProofFileName?: string | null },
) {
  if (!resendClient) {
    console.warn(
      "Resend API key not configured; skipping payment confirmation email",
    );
    return;
  }

  if (payload.role === "chair" || payload.role === "admin") {
    const content = buildChairAdminEmailContent(payload, "paid");

    await sendEmailAndLog(
      {
        from: FROM_EMAIL,
        to: payload.email,
        subject: content.subject,
        html: content.html,
        text: content.text,
      },
      { category: "payment-confirmed", recipient: payload.email },
    );
    return;
  }

  const nameForGreeting = greetingName(payload.firstName, payload.lastName);
  const fullName =
    formatFullName(payload.firstName, payload.lastName) || "Not provided";
  const roleLabel =
    payload.role.charAt(0).toUpperCase() + payload.role.slice(1);

  const html = renderEmailFrame({
    title: "Registration received",
    recipientEmail: payload.email,
    preheader: "We’ve received your VOFMUN registration and proof of payment.",
    contentHtml: `
      <p style="margin:0 0 12px;">Hi ${escapeHtml(nameForGreeting)},</p>

      <p style="margin:0 0 12px;">
        Thank you for registering for <strong>VOFMUN 2026</strong>. We have received your <strong>${escapeHtml(
          payload.role,
        )}</strong> application and your proof of payment.
      </p>

      <p style="margin:0 0 12px;">
        Our finance team will verify the transfer shortly and send your official confirmation with the next steps.
      </p>

      ${renderInfoCard([
        { label: "Full name", value: fullName },
        { label: "Role", value: roleLabel },
      ])}

      <p style="margin:0 0 18px;">
        We’ll be in touch soon with conference logistics, committee details, and any important updates.
      </p>

      <div style="border-top:1px solid ${EMAIL_COLORS.border};padding-top:14px;">
        <p style="margin:0;color:${EMAIL_COLORS.muted};font-size:13px;line-height:1.55;">
          Thank you for registering with VOFMUN.
        </p>
      </div>
    `,
  });

  const text = `Hi ${nameForGreeting},

Thank you for registering for VOFMUN 2026. We have received your ${payload.role} application and your proof of payment.

Our finance team will verify the transfer shortly and send your official confirmation with the next steps.

Registration summary:
- Full name: ${fullName}
- Role: ${roleLabel}

We’ll be in touch soon with conference logistics, committee details, and any important updates.

VOFMUN Secretariat`;

  await sendEmailAndLog(
    {
      from: FROM_EMAIL,
      to: payload.email,
      subject: "VOFMUN registration and payment received",
      html,
      text,
    },
    { category: "payment-confirmed", recipient: payload.email },
  );
}

export async function sendPaymentReminderEmail(
  payload: RegistrationEmailPayload,
) {
  if (!resendClient) {
    console.warn(
      "Resend API key not configured; skipping payment reminder email",
    );
    return;
  }

  if (payload.role === "chair" || payload.role === "admin") {
    const content = buildChairAdminEmailContent(payload, "unpaid");

    await sendEmailAndLog(
      {
        from: FROM_EMAIL,
        to: payload.email,
        subject: content.subject,
        html: content.html,
        text: content.text,
      },
      { category: "payment-reminder", recipient: payload.email },
    );
    return;
  }

  const nameForGreeting = greetingName(payload.firstName, payload.lastName);
  const proofLink = PAYMENT_DETAILS.proofUploadUrl;

  const html = renderEmailFrame({
    title: "Complete your payment",
    recipientEmail: payload.email,
    preheader: "Complete your VOFMUN payment to confirm your registration.",
    contentHtml: `
      <p style="margin:0 0 12px;">Hi ${escapeHtml(nameForGreeting)},</p>

      <p style="margin:0 0 12px;">
        Thank you for submitting your <strong>${escapeHtml(payload.role)}</strong> application for VOFMUN 2026.
      </p>

      <p style="margin:0 0 18px;">
        Your registration has been received, but your spot can only be confirmed once payment is completed and your proof of payment is uploaded.
      </p>

      ${renderStripeBoxHtml()}

      <p style="margin:0 0 12px;">
        You can pay via secure Stripe checkout or bank transfer:
      </p>

      ${renderPaymentDetailsCardHtml()}

      <div style="border:1px solid ${EMAIL_COLORS.border};border-radius:14px;background:#fffaf7;padding:16px;margin:18px 0;">
        <div style="font-size:16px;font-weight:900;color:${EMAIL_COLORS.text};margin-bottom:8px;">
          Upload proof after paying
        </div>
        <p style="margin:0 0 12px;color:${EMAIL_COLORS.muted};font-size:14px;line-height:1.6;">
          After payment, please upload proof of payment (screenshot or receipt) so we can confirm your registration.
        </p>
        ${renderButton("Upload proof of payment", proofLink)}
        <p style="margin:0;color:${EMAIL_COLORS.link};font-size:13px;line-height:1.55;word-break:break-all;">
          <a href="${PAYMENT_PAGE_URL}" style="color:${EMAIL_COLORS.link};text-decoration:none;">${PAYMENT_PAGE_URL}</a>
        </p>
      </div>

      <div style="border-top:1px solid ${EMAIL_COLORS.border};padding-top:14px;">
        <p style="margin:0;color:${EMAIL_COLORS.muted};font-size:13px;line-height:1.55;">
          If you have already paid, simply upload your receipt and we will review it as soon as possible.
        </p>
      </div>
    `,
  });

  const stripeText =
    HAS_STRIPE_PAYMENT_LINK && STRIPE_PAYMENT_URL
      ? `Pay now via Stripe: ${STRIPE_PAYMENT_URL}\n\n`
      : "";
  const text = `Hi ${nameForGreeting},

Thank you for submitting your ${payload.role} application for VOFMUN 2026.

Your registration has been received, but your spot can only be confirmed once payment is completed and your proof of payment is uploaded.

${stripeText}You can pay via secure Stripe checkout or bank transfer:

${renderPaymentDetailsText()}

After payment, upload your proof of payment here:
${proofLink}

Full payment details:
${PAYMENT_PAGE_URL}

If you have already paid, simply upload your receipt and we will review it as soon as possible.

VOFMUN Secretariat`;

  await sendEmailAndLog(
    {
      from: FROM_EMAIL,
      to: payload.email,
      subject: "Complete your VOFMUN registration payment",
      html,
      text,
    },
    { category: "payment-reminder", recipient: payload.email },
  );
}

export async function sendDelegateReferralCodeEmail(payload: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  referralCode: string;
}) {
  if (!resendClient) {
    console.warn(
      "Resend API key not configured; skipping delegate referral code email",
    );
    return;
  }

  const nameForGreeting = greetingName(payload.firstName, payload.lastName);
  const normalizedCode = payload.referralCode.trim().toUpperCase();

  const html = renderEmailFrame({
    title: "Your referral code",
    recipientEmail: payload.email,
    preheader: "Your personal VOFMUN delegate referral code is ready.",
    contentHtml: `
      <p style="margin:0 0 12px;">Hi ${escapeHtml(nameForGreeting)},</p>

      <p style="margin:0 0 12px;">
        Here is your personal VOFMUN delegate referral code:
      </p>

      <div style="border:1px solid ${EMAIL_COLORS.border};border-radius:16px;background:#fcfbf8;padding:18px;text-align:center;margin:14px 0 18px;">
        <div style="font-size:12px;font-weight:900;letter-spacing:.10em;text-transform:uppercase;color:${EMAIL_COLORS.muted};margin-bottom:8px;">
          Referral code
        </div>
        <div style="font-size:32px;font-weight:900;letter-spacing:.16em;color:${EMAIL_COLORS.primary};line-height:1.2;">
          ${escapeHtml(normalizedCode)}
        </div>
      </div>

      <p style="margin:0 0 12px;">
        You can share or use this code during VOFMUN delegate registrations where referral codes are accepted.
      </p>

      <div style="border-top:1px solid ${EMAIL_COLORS.border};padding-top:14px;">
        <p style="margin:0;color:${EMAIL_COLORS.muted};font-size:13px;line-height:1.55;">
          Please copy and use the code exactly as shown above.
        </p>
      </div>
    `,
  });

  const text = `Hi ${nameForGreeting},

Here is your personal VOFMUN delegate referral code:

${normalizedCode}

You can share or use this code during VOFMUN delegate registrations where referral codes are accepted.

Please use the code exactly as shown above.

VOFMUN Secretariat`;

  await sendEmailAndLog(
    {
      from: FROM_EMAIL,
      to: payload.email,
      subject: "Your VOFMUN Delegate Referral Code",
      html,
      text,
    },
    { category: "delegate-referral-code", recipient: payload.email },
  );
}

export async function sendShortPaymentReminderEmail(
  payload: RegistrationEmailPayload,
) {
  if (!resendClient) {
    console.warn(
      "Resend API key not configured; skipping short payment reminder email",
    );
    return;
  }

  if (payload.role === "chair" || payload.role === "admin") {
    const content = buildChairAdminEmailContent(payload, "unpaid");

    const response = await sendEmailAndLog(
      {
        from: FROM_EMAIL,
        to: payload.email,
        subject: content.subject,
        html: content.html,
        text: content.text,
      },
      { category: "payment-reminder-short", recipient: payload.email },
    );

    if (response.error)
      throw new Error(
        `Failed to send reminder email: ${response.error.message}`,
      );
    return;
  }

  const nameForGreeting = greetingName(payload.firstName, payload.lastName);
  const proofLink = PAYMENT_DETAILS.proofUploadUrl;

  const html = renderEmailFrame({
    title: "Quick payment reminder",
    recipientEmail: payload.email,
    preheader: "A quick reminder to complete your VOFMUN payment.",
    contentHtml: `
      <p style="margin:0 0 12px;">Hi ${escapeHtml(nameForGreeting)},</p>

      <p style="margin:0 0 18px;">
        This is a quick reminder to complete your payment for VOFMUN 2026 so we can confirm your delegate spot.
      </p>

      ${renderStripeBoxHtml()}

      <p style="margin:0 0 12px;">
        You can pay via secure Stripe checkout or bank transfer:
      </p>

      ${renderPaymentDetailsCardHtml()}

      <div style="border:1px solid ${EMAIL_COLORS.border};border-radius:14px;background:#fffaf7;padding:16px;margin:18px 0;">
        <div style="font-size:16px;font-weight:900;color:${EMAIL_COLORS.text};margin-bottom:8px;">
          Upload proof after paying
        </div>
        <p style="margin:0 0 12px;color:${EMAIL_COLORS.muted};font-size:14px;line-height:1.6;">
          After payment, please upload proof of payment (screenshot or receipt) so we can confirm your registration.
        </p>
        ${renderButton("Upload proof of payment", proofLink)}
        <p style="margin:0;color:${EMAIL_COLORS.link};font-size:13px;line-height:1.55;word-break:break-all;">
          <a href="${PAYMENT_PAGE_URL}" style="color:${EMAIL_COLORS.link};text-decoration:none;">${PAYMENT_PAGE_URL}</a>
        </p>
      </div>

      <div style="border-top:1px solid ${EMAIL_COLORS.border};padding-top:14px;">
        <p style="margin:0;color:${EMAIL_COLORS.muted};font-size:13px;line-height:1.55;">
          If you have already paid, you can ignore this message.
        </p>
      </div>
    `,
  });

  const stripeText =
    HAS_STRIPE_PAYMENT_LINK && STRIPE_PAYMENT_URL
      ? `Pay now via Stripe: ${STRIPE_PAYMENT_URL}\n\n`
      : "";
  const text = `Hi ${nameForGreeting},

This is a quick reminder to complete your payment for VOFMUN 2026 so we can confirm your delegate spot.

${stripeText}You can pay via secure Stripe checkout or bank transfer:

${renderPaymentDetailsText()}

After payment, upload your proof of payment here:
${proofLink}

Full payment details:
${PAYMENT_PAGE_URL}

If you have already paid, you can ignore this message.

VOFMUN Secretariat`;

  const response = await sendEmailAndLog(
    {
      from: FROM_EMAIL,
      to: payload.email,
      subject: "Quick reminder — complete your VOFMUN payment",
      html,
      text,
    },
    { category: "payment-reminder-short", recipient: payload.email },
  );

  if (response.error)
    throw new Error(`Failed to send reminder email: ${response.error.message}`);
}

export async function sendPaymentReminderAuditEmail(
  payload: PaymentReminderAuditPayload,
) {
  if (!resendClient) {
    console.warn(
      "Resend API key not configured; skipping payment reminder audit email",
    );
    return;
  }

  const html = renderEmailFrame({
    title: "Payment reminder activity log",
    recipientEmail: "dxb.avg@gmail.com",
    preheader: "A payment reminder action was recorded from the system portal.",
    contentHtml: `
      <p style="margin:0 0 12px;">
        A payment reminder action was performed from the VOFMUN system portal.
      </p>

      ${renderInfoCard([
        { label: "Action type", value: payload.actionType },
        { label: "Selection mode", value: payload.selectionMode },
        { label: "IP address", value: payload.ipAddress },
        { label: "Device / User-Agent", value: payload.deviceInfo },
        {
          label: "Recipients attempted",
          value: String(payload.recipientsAttempted),
        },
        { label: "Reminders sent", value: String(payload.remindersSent) },
        { label: "Reminders failed", value: String(payload.remindersFailed) },
      ])}

      <div style="border-top:1px solid ${EMAIL_COLORS.border};padding-top:14px;">
        <p style="margin:0;color:${EMAIL_COLORS.muted};font-size:13px;line-height:1.55;">
          This email is for administrative tracking only.
        </p>
      </div>
    `,
  });

  const text = `Payment reminder action detected.

Action type: ${payload.actionType}
Selection mode: ${payload.selectionMode}
IP address: ${payload.ipAddress}
Device/User-Agent: ${payload.deviceInfo}
Recipients attempted: ${payload.recipientsAttempted}
Reminders sent: ${payload.remindersSent}
Reminders failed: ${payload.remindersFailed}`;

  const response = await sendEmailAndLog(
    {
      from: FROM_EMAIL,
      to: "dxb.avg@gmail.com",
      subject: "VOFMUN payment reminder activity log",
      html,
      text,
    },
    { category: "payment-reminder-audit", recipient: "dxb.avg@gmail.com" },
  );

  if (response.error)
    throw new Error(
      `Failed to send payment reminder audit email: ${response.error.message}`,
    );
}
