"use client"

import { useFormState, useFormStatus } from "react-dom"
import { Lock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Verifying..." : "Unlock"}
    </Button>
  )
}

export function PasswordGate({ authenticate }: PasswordGateProps) {
  const [state, formAction] = useFormState(authenticate, initialState)

  return (
    <div className="mx-auto max-w-md">
      <Card className="border-slate-800 bg-slate-900/70 text-slate-100 shadow-2xl">
        <CardHeader className="px-6 py-6">
          <div className="mb-2 flex items-center gap-2 text-slate-300">
            <Lock className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.2em]">Restricted Access</span>
          </div>
          <CardTitle className="text-2xl font-serif font-semibold text-slate-50">
            Solstice Archives
          </CardTitle>
          <CardDescription className="text-slate-400">
            Enter the access phrase to access page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-6 pb-6">
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-200">
                Access phrase
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                className="bg-slate-950/40 text-slate-100 placeholder:text-slate-500"
                autoComplete="current-password"
                required
              />
            </div>
            {state.error && <p className="text-sm text-red-400">{state.error}</p>}
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
