"use client"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

export default function SystemGoogleLogin() {
  const signIn = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/system`,
      },
    })
  }

  return (
    <div className="mx-auto max-w-md">
      <Button onClick={signIn} className="w-full">
        Sign in with Google
      </Button>
    </div>
  )
}
