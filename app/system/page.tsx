import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  SYSTEM_ADMIN_AUTH_COOKIE,
  createSystemAdminToken,
  verifySystemAdminToken,
} from "@/lib/auth/system-admin"

import { PasswordGate, type PasswordFormState } from "./password-gate"
import { PortalContent } from "./portal-content"

const REMEMBERED_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 4

export default async function SystemPage() {
  const requiredPassword = process.env.SIGNUP_PORTAL_PASSWORD
  const authSecret = process.env.SYSTEM_AUTH_SECRET

  if (!requiredPassword || !authSecret) {
    const missingEnv = [
      !requiredPassword ? "SIGNUP_PORTAL_PASSWORD" : null,
      !authSecret ? "SYSTEM_AUTH_SECRET" : null,
    ].filter(Boolean) as string[]

    return (
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
  }

  const cookieStore = await cookies()
  const existingToken = cookieStore.get(SYSTEM_ADMIN_AUTH_COOKIE)?.value
  const verifiedToken = existingToken ? verifySystemAdminToken(existingToken) : null
  const isAuthorized = Boolean(verifiedToken)

  async function authenticateAction(_: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
    "use server"

    const submittedPassword = formData.get("password")

    if (typeof submittedPassword !== "string" || submittedPassword.trim().length === 0) {
      return { error: "Password is required." }
    }

    if (submittedPassword !== requiredPassword) {
      return { error: "Invalid password provided." }
    }

    const rememberDevice = formData.get("remember-device") === "on"
    const authCookies = await cookies()

    const token = createSystemAdminToken(
      rememberDevice ? REMEMBERED_MAX_AGE_SECONDS * 1000 : SESSION_MAX_AGE_SECONDS * 1000,
    )

    authCookies.set({
      name: SYSTEM_ADMIN_AUTH_COOKIE,
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberDevice ? REMEMBERED_MAX_AGE_SECONDS : SESSION_MAX_AGE_SECONDS,
      path: "/",
    })

    redirect("/system")
  }

  async function signOutAction() {
    "use server"

    const authCookies = await cookies()
    authCookies.delete(SYSTEM_ADMIN_AUTH_COOKIE)
    redirect("/system")
  }

  return (
    <main className="min-h-screen bg-[#ffecdd] text-slate-900">
      <div className="container mx-auto px-4 py-16">
        {isAuthorized ? (
          <PortalContent onSignOut={signOutAction} />
        ) : (
          <PasswordGate authenticate={authenticateAction} />
        )}
      </div>
    </main>
  )
}
