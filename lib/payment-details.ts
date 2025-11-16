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

export const PAYMENT_DETAILS_INTRO = "Please complete your payment via bank transfer:"

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
