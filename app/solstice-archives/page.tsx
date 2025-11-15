import { createHash } from "crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { PasswordGate, type PasswordFormState } from "./password-gate"
import { PortalContent } from "./portal-content"

const AUTH_COOKIE_NAME = "solstice_archives_auth"

const hashValue = (value: string) => createHash("sha256").update(value).digest("hex")

export default async function SolsticeArchivesPage() {
  const requiredPassword = process.env.SIGNUP_PORTAL_PASSWORD

  if (!requiredPassword) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl">
            <h1 className="mb-4 text-2xl font-serif font-semibold">Configuration required</h1>
            <p className="text-sm text-slate-300">
              Set the <code className="rounded bg-slate-800 px-2 py-1">SIGNUP_PORTAL_PASSWORD</code> environment variable to enable this
              page.
            </p>
          </div>
        </div>
      </main>
    )
  }

  const cookieStore = await cookies()
  const expectedHash = hashValue(requiredPassword)
  const existingToken = cookieStore.get(AUTH_COOKIE_NAME)?.value
  const isAuthorized = existingToken === expectedHash

  async function authenticateAction(_: PasswordFormState, formData: FormData): Promise<PasswordFormState> {
    "use server"

    const submittedPassword = formData.get("password")

    if (typeof submittedPassword !== "string" || submittedPassword.trim().length === 0) {
      return { error: "Password is required." }
    }

    if (hashValue(submittedPassword) !== expectedHash) {
      return { error: "Invalid password provided." }
    }

    const authCookies = await cookies()
    authCookies.set({
      name: AUTH_COOKIE_NAME,
      value: expectedHash,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 4,
      path: "/",
    })

    redirect("/solstice-archives")
  }

  async function signOutAction() {
    "use server"

    const authCookies = await cookies()
    authCookies.delete(AUTH_COOKIE_NAME)
    redirect("/solstice-archives")
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
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
