import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SYSTEM_ADMIN_AUTH_COOKIE, verifySystemAdminToken } from "@/lib/auth/system-admin"

import { loadEligibleRecipients } from "./data"
import { PaymentReminderForm } from "./reminder-form"

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

        <div className="mx-auto max-w-2xl">
          <PaymentReminderForm eligibleCount={eligibleCount} resendConfigured={Boolean(process.env.RESEND_API_KEY)} recipients={eligibleRecipients} />
        </div>
      </div>
    </main>
  )
}
