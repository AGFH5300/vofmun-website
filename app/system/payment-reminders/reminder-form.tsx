"use client"

import { useEffect, useMemo, useState } from "react"
import { useFormState, useFormStatus } from "react-dom"
import { AlertCircle, CheckCircle2, MailWarning, Send } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { EligibleRecipient } from "./types"

const formatPaymentStatus = (status: string | null) => {
  switch (status) {
    case "paid":
      return "Paid"
    case "pending":
      return "Pending review"
    case "flagged":
      return "Flagged"
    case "need_more_info":
      return "Need more info"
    case "fake":
      return "Fake"
    case "refunded":
      return "Refunded"
    default:
      return "Unpaid"
  }
}

export type ReminderFormState = {
  status: "idle" | "success" | "error"
  message?: string
  sentCount?: number
}

type ReminderFormProps = {
  action: (previousState: ReminderFormState, formData: FormData) => Promise<ReminderFormState>
  eligibleCount: number
  resendConfigured: boolean
  recipients: EligibleRecipient[]
}

const initialState: ReminderFormState = { status: "idle" }

function SubmitButton({
  resendConfigured,
  sendableCount,
}: {
  resendConfigured: boolean
  sendableCount: number
}) {
  const { pending } = useFormStatus()

  const label = useMemo(() => {
    if (!resendConfigured) return "Email setup required"
    if (!sendableCount) return "No emailable delegates"
    if (pending) return "Sending reminders..."
    return `Send reminder to ${sendableCount} delegate${sendableCount === 1 ? "" : "s"}`
  }, [pending, resendConfigured, sendableCount])

  return (
    <Button
      type="submit"
      disabled={pending || sendableCount === 0 || !resendConfigured}
      className="w-full bg-[#B22222] text-white hover:bg-[#9b1d1d] sm:w-auto"
    >
      <Send className="mr-2 h-4 w-4" />
      {label}
    </Button>
  )
}

export function PaymentReminderForm({ action, eligibleCount, recipients, resendConfigured }: ReminderFormProps) {
  const [state, formAction] = useFormState(action, initialState)
  const [selectedIds, setSelectedIds] = useState<number[]>(() => recipients.map((recipient) => recipient.id))

  useEffect(() => {
    setSelectedIds(recipients.map((recipient) => recipient.id))
  }, [recipients])

  const emailReadyRecipients = useMemo(() => recipients.filter((recipient) => Boolean(recipient.email)), [recipients])
  const selectedCount = selectedIds.length
  const selectedEmailCount = useMemo(
    () => recipients.filter((recipient) => recipient.email && selectedIds.includes(recipient.id)).length,
    [recipients, selectedIds],
  )
  const selectionMode: "all" | "selected" =
    selectedCount === recipients.length && selectedCount > 0 ? "all" : "selected"

  const reminderFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
      }),
    [],
  )

  const toggleRecipient = (recipientId: number, checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedIds((prev) => (prev.includes(recipientId) ? prev : [...prev, recipientId]))
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== recipientId))
    }
  }

  const toggleAll = (checked: boolean | "indeterminate") => {
    if (checked) {
      setSelectedIds(recipients.map((recipient) => recipient.id))
    } else {
      setSelectedIds([])
    }
  }

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
          Send reminder emails directly from the portal or record reminders you sent manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="default" className="border-slate-200 bg-slate-50">
          <MailWarning className="h-5 w-5 text-[#B22222]" />
          <AlertTitle className="text-sm font-semibold text-slate-900">Recipients</AlertTitle>
          <AlertDescription className="text-sm text-slate-700">
            {eligibleCount > 0 ? (
              <span>
                {eligibleCount} delegate{eligibleCount === 1 ? " is" : "s are"} marked as unpaid and ready for reminders.
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

        <form action={formAction} className="space-y-4">
          <div className="rounded-lg border border-slate-200">
            <div className="flex items-center justify-between gap-4 p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Choose recipients</p>
                <p className="text-xs text-slate-600">
                  Select everyone marked as unpaid, or send to specific delegates using the checkboxes below.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="select-all"
                  checked={selectionMode === "all" && recipients.length > 0}
                  onCheckedChange={toggleAll}
                  disabled={!recipients.length}
                />
                <Label htmlFor="select-all" className="text-sm font-medium text-slate-800">
                  Send to all unpaid delegates
                </Label>
              </div>
            </div>
            <Separator />
            <div className="max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/60">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="min-w-[180px] text-sm font-semibold text-slate-800">Delegate</TableHead>
                    <TableHead className="min-w-[180px] text-sm font-semibold text-slate-800">Email</TableHead>
                    <TableHead className="min-w-[120px] text-sm font-semibold text-slate-800">Payment status</TableHead>
                    <TableHead className="min-w-[120px] text-sm font-semibold text-slate-800">Reminders sent</TableHead>
                    <TableHead className="min-w-[160px] text-sm font-semibold text-slate-800">Last reminder</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-600">
                        There are no delegates currently marked as unpaid.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recipients.map((recipient) => {
                      const isSelected = selectedIds.includes(recipient.id)

                      return (
                        <TableRow key={recipient.id} className="hover:bg-slate-50/70">
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => toggleRecipient(recipient.id, checked)}
                              aria-label={`Select ${recipient.name}`}
                            />
                          </TableCell>
                          <TableCell className="text-sm font-medium text-slate-900">{recipient.name}</TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {recipient.email ?? <span className="text-xs text-slate-500">Missing email</span>}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {formatPaymentStatus(recipient.paymentStatus ?? "unpaid")}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {recipient.reminderCount > 0
                              ? `${recipient.reminderCount} time${recipient.reminderCount === 1 ? "" : "s"}`
                              : "Never"}
                          </TableCell>
                          <TableCell className="text-sm text-slate-700">
                            {recipient.lastReminderAt
                              ? reminderFormatter.format(new Date(recipient.lastReminderAt))
                              : "—"}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <input type="hidden" name="selectionMode" value={selectionMode} />
          {selectionMode === "selected" &&
            selectedIds.map((id) => <input key={id} type="hidden" name="recipient" value={id} />)}

          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <SubmitButton sendableCount={selectedEmailCount} resendConfigured={resendConfigured} />
              <Button
                type="submit"
                variant="outline"
                name="actionType"
                value="record"
                className="w-full border-amber-200 text-amber-900 hover:bg-amber-50 sm:w-auto"
                disabled={selectedCount === 0}
              >
                <MailWarning className="mr-2 h-4 w-4" />
                Record manual reminder
              </Button>
            </div>
            <div className="space-y-1 text-xs text-slate-600 sm:text-right">
              <p>
                Delegates without an email address are included when recording manual reminders but skipped when sending
                emails.
              </p>
              <p>The reminder template reuses the existing payment instructions and proof upload link.</p>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
