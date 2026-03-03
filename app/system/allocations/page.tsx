// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import SystemGoogleLogin from "../system-google-login"
import { AllocationsPortal } from "./allocations-portal"
import { canAccessAllocations, isSystemAdmin } from "../_lib/allowlist"
import { LogOut } from "lucide-react"

/**
 * Allocations portal access is controlled by SYSTEM_ADMIN_EMAILS and SYSTEM_ALLOCATOR_EMAILS.
 * Writes are intentionally routed through server API endpoints using the service role key, because
 * browser-side direct updates are not safe while RLS is disabled on public.users.
 */
export default async function SystemAllocationsPage() {
  const supabase = await createClient()
  const signOutAction = async () => {
    "use server"
    const scopedSupabase = await createClient()
    await scopedSupabase.auth.signOut()
  }

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

  if (!canAccessAllocations(user.email)) {
    return (
      <main className="min-h-screen bg-[#ffecdd] text-slate-900">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-8 text-center shadow-xl">
            <h1 className="mb-2 text-xl font-semibold text-red-600">Access denied</h1>
            <p className="text-sm text-slate-600">
              This Google account is not allowed to access the allocations portal.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Signed in as: <span className="font-mono">{user.email}</span>
            </p>
            <form action={signOutAction} className="mt-6">
              <Button type="submit" variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out and switch account
              </Button>
            </form>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#ffecdd] text-slate-900">
      <div className="container mx-auto px-4 py-16">
        <AllocationsPortal isAdmin={isSystemAdmin(user.email)} onSignOut={signOutAction} />
      </div>
    </main>
  )
}
