import { createClient } from "@/utils/supabase/server"
import SystemGoogleLogin from "./system-google-login"
import { PortalContent } from "./portal-content"

function parseAllowList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export default async function SystemPage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (!user) {
    return (
      <main className="min-h-screen bg-[#ffecdd] text-slate-900">
        <div className="container mx-auto px-4 py-16">
          <SystemGoogleLogin />
        </div>
      </main>
    )
  }

  const allowed = parseAllowList(process.env.SYSTEM_ADMIN_EMAILS)
  const email = (user.email ?? "").toLowerCase()

  if (allowed.length > 0 && (!email || !allowed.includes(email))) {
    await supabase.auth.signOut()

    return (
      <main className="min-h-screen bg-[#ffecdd] text-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-xl">
            <h1 className="mb-2 text-xl font-semibold text-red-600">Access denied</h1>
            <p className="text-sm text-slate-600">
              This Google account is not allowed to access the system portal.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Signed in as: <span className="font-mono">{user.email}</span>
            </p>
          </div>
        </div>
      </main>
    )
  }

  async function signOutAction() {
    "use server"
    const supabase = await createClient()
    await supabase.auth.signOut()
  }

  return (
    <main className="min-h-screen bg-[#ffecdd] text-slate-900">
      <div className="container mx-auto px-4 py-16">
        <PortalContent onSignOut={signOutAction} />
      </div>
    </main>
  )
}
