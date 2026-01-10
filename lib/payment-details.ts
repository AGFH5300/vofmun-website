export const STRIPE_PAYMENT_URL =
  (process.env.NEXT_PUBLIC_STRIPE_PAYMENT_URL ?? "").trim() ||
  "https://buy.stripe.com/cNiaEWba42k75iw83lcAo01"

export const HAS_STRIPE_PAYMENT_LINK = STRIPE_PAYMENT_URL.length > 0

export const PAYMENT_DETAILS = {
  beneficiaryName: "Vishesh Shah Event Management LLC",
  bankBranch: "Business Bay, ADCB",
  iban: "AE600030014327809820001",
  accountNumber: "14327809820001",
  currency: "AED",
  paymentReference: "[Your Full Name] – VOFMUN Registration",
  proofInstructions: "After payment, please upload proof of payment (screenshot or receipt).",
  proofUploadUrl: "https://vofmun.org/proof-of-payment",
}

export const PAYMENT_DETAILS_INTRO = HAS_STRIPE_PAYMENT_LINK
  ? "You can pay via secure Stripe checkout or bank transfer:"
  : "Please complete your payment via bank transfer:"

export const PAYMENT_DETAILS_ENTRIES = [
  { label: "Beneficiary Name", value: PAYMENT_DETAILS.beneficiaryName },
  { label: "Bank Branch", value: PAYMENT_DETAILS.bankBranch },
  { label: "IBAN", value: PAYMENT_DETAILS.iban },
  { label: "Account Number", value: PAYMENT_DETAILS.accountNumber },
  { label: "Currency", value: PAYMENT_DETAILS.currency },
  { label: "Payment Reference", value: PAYMENT_DETAILS.paymentReference },
]

export function renderPaymentDetailsHtml() {
  const rows = PAYMENT_DETAILS_ENTRIES.map(
    (entry) => `
      <tr>
        <td style="padding: 6px 0; font-weight: 600; color: #111827;">${entry.label}</td>
        <td style="padding: 6px 0; color: #1f2937;">${entry.value}</td>
      </tr>
    `,
  ).join("")

  return `
    <table role="presentation" style="width: 100%; max-width: 520px; border-collapse: collapse;">
      <tbody>${rows}</tbody>
    </table>
  `
}

export function renderPaymentDetailsText() {
  return [
    PAYMENT_DETAILS_INTRO,
    ...PAYMENT_DETAILS_ENTRIES.map((entry) => `${entry.label}: ${entry.value}`),
    PAYMENT_DETAILS.proofInstructions,
    `Upload proof: ${PAYMENT_DETAILS.proofUploadUrl}`,
  ].join("\n")
}

export function renderStripeCtaHtml() {
  if (!HAS_STRIPE_PAYMENT_LINK) return ""

  return `
    <p style=\"margin: 14px 0 8px; font-weight: 600; color: #111827; font-size: 14px;\">Or pay instantly with Stripe:</p>
    <a
      href=\"${STRIPE_PAYMENT_URL}\"
      style=\"
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 11px 18px;
        background-color: #635bff;
        color: #ffffff;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 15px;
        font-weight: 600;
        border-radius: 7px;
        text-decoration: none;
        transition: background-color 0.2s ease;
      \"
      target=\"_blank\"
      rel=\"noopener noreferrer\"
    >
      Pay now via Stripe
      <span style=\"display: inline-block; transition: transform 0.25s ease;\">➜</span>
    </a>
  `
}

export function renderStripeCtaText() {
  if (!HAS_STRIPE_PAYMENT_LINK) return ""
  return `Or pay instantly with Stripe: ${STRIPE_PAYMENT_URL}`
}
