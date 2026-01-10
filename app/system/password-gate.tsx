"use client"

import { useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { Eye, EyeOff, Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

export type PasswordFormState = {
  error: string | null
}

type PasswordGateProps = {
  authenticate: (
    state: PasswordFormState,
    formData: FormData,
  ) => Promise<PasswordFormState>
}

const initialState: PasswordFormState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      className="w-full bg-[#B22222] text-white hover:bg-[#8B1A1A]"
      disabled={pending}
    >
      {pending ? "Verifying..." : "Unlock"}
    </Button>
  )
}

export function PasswordGate({ authenticate }: PasswordGateProps) {
  const [state, formAction] = useFormState(authenticate, initialState)
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="mx-auto max-w-md">
      <Card className="border-[#B22222]/30 bg-white text-slate-900 shadow-2xl">
        <CardHeader className="px-6 py-6">
          <div className="mb-2 flex items-center gap-2 text-[#B22222]/80">
            <Lock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em]">Restricted Access</span>
          </div>
          <CardTitle className="text-2xl font-serif font-semibold text-[#B22222]">
            System
          </CardTitle>
          <CardDescription className="text-slate-600">
            Enter the access phrase to unlock the portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-700">
                Access phrase
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="bg-slate-100 pr-10 text-slate-900 placeholder:text-slate-500"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 transition hover:text-slate-800"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <Checkbox id="remember-device" name="remember-device" defaultChecked />
              <label htmlFor="remember-device">Remember this device</label>
            </div>
            {state.error && <p className="text-sm text-red-500">{state.error}</p>}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
