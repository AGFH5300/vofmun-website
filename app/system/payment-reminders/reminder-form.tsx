"use client"

import { useMemo } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { AlertCircle, CheckCircle2, MailWarning, Send } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export type ReminderFormState = {
  status: "idle" | "success" | "error"
  message?: string
  sentCount?: number
}

type ReminderFormProps = {
  action: (previousState: ReminderFormState, formData: FormData) => Promise<ReminderFormState>
  eligibleCount: number
  resendConfigured: boolean
}

const initialState: ReminderFormState = { status: "idle" }

function SubmitButton({ eligibleCount, resendConfigured }: { eligibleCount: number; resendConfigured: boolean }) {
  const { pending } = useFormStatus()

  const label = useMemo(() => {
    if (!eligibleCount) return "No delegates to notify"
    if (pending) return "Sending reminders..."
    return `Send reminder to ${eligibleCount} delegate${eligibleCount === 1 ? "" : "s"}`
  }, [eligibleCount, pending])

  return (
    <Button
      type="submit"
      disabled={pending || eligibleCount === 0 || !resendConfigured}
      className="w-full bg-[#B22222] text-white hover:bg-[#9b1d1d]"
    >
      <Send className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}

export function PaymentReminderForm({ action, eligibleCount, resendConfigured }: ReminderFormProps) {
  const [state, formAction] = useFormState(action, initialState)

  return (
    <Card className="border-amber-100 bg-white shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-semibold text-slate-900">Send reminder email</CardTitle>
          <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-900">
            Delegates only
          </Badge>
        </div>
        <CardDescription className="text-sm text-slate-600">
          This will email every delegate without a recorded payment using the payment reminder template.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="border-slate-200 bg-slate-50">
          <MailWarning className="h-5 w-5 text-[#B22222]" />
          <AlertTitle className="text-sm font-semibold text-slate-900">Recipients</AlertTitle>
          <AlertDescription className="text-sm text-slate-700">
            {eligibleCount > 0 ? (
              <span>
                {eligibleCount} delegate{eligibleCount === 1 ? " is" : "s are"} marked as unpaid.
              </span>
            ) : (
              <span>There are no delegates currently marked as unpaid.</span>
            )}
          </AlertDescription>
        </Alert>

        {!resendConfigured && (
          <Alert variant="destructive" className="border-[#B22222]/40 bg-[#fff6f4] text-[#7a1414]">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-sm font-semibold">Email service not configured</AlertTitle>
            <AlertDescription className="text-sm">
              Add your <code>RESEND_API_KEY</code> environment variable to enable outgoing reminders.
            </AlertDescription>
          </Alert>
        )}

        {state.message && (
          <Alert variant={state.status === "success" ? "default" : "destructive"}>
            {state.status === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <AlertTitle className="text-sm font-semibold">
              {state.status === "success" ? "Reminders sent" : "Action needed"}
            </AlertTitle>
            <AlertDescription className="text-sm text-slate-700">
              {state.message}
              {typeof state.sentCount === "number" && state.sentCount > 0
                ? ` (${state.sentCount} email${state.sentCount === 1 ? "" : "s"} sent)`
                : null}
            </AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="space-y-3">
          <SubmitButton eligibleCount={eligibleCount} resendConfigured={resendConfigured} />
          <p className="text-center text-xs text-slate-500">
            The reminder template reuses the existing payment instructions and proof upload link.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
