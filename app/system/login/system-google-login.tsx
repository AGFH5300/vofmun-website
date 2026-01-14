"use client"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

export default function SystemGoogleLogin() {
  const supabase = createClient()

  async function signIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback?next=/system`,
      },
    })
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-[#B22222]/30 bg-white p-8 text-center shadow-xl">
      <h1 className="mb-2 text-2xl font-serif font-semibold text-[#B22222]">System</h1>
      <p className="mb-6 text-sm text-slate-600">Sign in with Google to access the portal.</p>
      <Button className="w-full bg-[#B22222] text-white hover:bg-[#8B1A1A]" onClick={signIn}>
        Continue with Google
      </Button>
      <p className="mt-3 text-xs text-slate-500">Access is restricted to approved admin emails.</p>
    </div>
  )
}
