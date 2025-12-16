"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, MailWarning, Send } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
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
  eligibleCount: number
  resendConfigured: boolean
  recipients: EligibleRecipient[]
}

function SubmitButton({ resendConfigured, sendableCount, isSending }: { resendConfigured: boolean; sendableCount: number; isSending: boolean }) {
  const label = useMemo(() => {
    if (!resendConfigured) return "Email setup required"
    if (!sendableCount) return "No emailable delegates"
    if (isSending) return "Sending reminders..."
    return `Send reminder to ${sendableCount} delegate${sendableCount === 1 ? "" : "s"}`
  }, [isSending, resendConfigured, sendableCount])

  return (
    <Button
      type="submit"
      disabled={isSending || sendableCount === 0 || !resendConfigured}
      className="w-full bg-[#B22222] text-white hover:bg-[#9b1d1d] sm:w-auto"
    >
      {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  )
}

export function PaymentReminderForm({ eligibleCount, recipients, resendConfigured }: ReminderFormProps) {
  const [selectedIds, setSelectedIds] = useState<number[]>(() => recipients.map((recipient) => recipient.id))
  const [state, setState] = useState<ReminderFormState>({ status: "idle" })
  const [recipientList, setRecipientList] = useState<EligibleRecipient[]>(recipients)
  const [progress, setProgress] = useState(0)
  const [isSending, setIsSending] = useState(false)

  useEffect(() => {
    setRecipientList(recipients)
    setSelectedIds(recipients.map((recipient) => recipient.id))
  }, [recipients])

  const selectedCount = selectedIds.length
  const selectedEmailCount = useMemo(
    () => recipientList.filter((recipient) => recipient.email && selectedIds.includes(recipient.id)).length,
    [recipientList, selectedIds],
  )
  const selectionMode: "all" | "selected" =
    selectedCount === recipientList.length && selectedCount > 0 ? "all" : "selected"

  const reminderFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Dubai",
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
      setSelectedIds(recipientList.map((recipient) => recipient.id))
    } else {
      setSelectedIds([])
    }
  }

  const recipientsWithEmails = useMemo(
    () => recipientList.filter((recipient) => recipient.email && selectedIds.includes(recipient.id)),
    [recipientList, selectedIds],
  )

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!resendConfigured) return
    if (recipientsWithEmails.length === 0) {
      setState({
        status: "idle",
        message:
          selectionMode === "selected"
            ? "Select at least one recipient."
            : "No unpaid delegates with valid emails found to notify.",
      })
      return
    }

    setIsSending(true)
    setProgress(0)
    setState({ status: "idle" })
    let failures = 0

    for (let index = 0; index < recipientsWithEmails.length; index += 1) {
      const recipient = recipientsWithEmails[index]
      try {
        const response = await fetch("/api/system/payment-reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: recipient.id }),
        })

        if (!response.ok) {
          failures += 1
        } else {
          const { reminderCount, recordedAt } = (await response.json()) as { reminderCount?: number; recordedAt?: string }

          setRecipientList((prev) =>
            prev.map((entry) =>
              entry.id === recipient.id
                ? {
                    ...entry,
                    reminderCount: reminderCount ?? entry.reminderCount + 1,
                    lastReminderAt: recordedAt ?? new Date().toISOString(),
                  }
                : entry,
            ),
          )
        }
      } catch (error) {
        console.error("Failed to send reminder", { recipientId: recipient.id, error })
        failures += 1
      }

      const completed = Math.round(((index + 1) / recipientsWithEmails.length) * 100)
      setProgress(completed)
    }

    const resultState: ReminderFormState =
      failures > 0
        ? {
            status: "error",
            message: `Reminders sent with ${failures} failure${failures === 1 ? "" : "s"}.`,
            sentCount: recipientsWithEmails.length - failures,
          }
        : {
            status: "success",
            message:
              selectionMode === "selected"
                ? "Payment reminders sent to the selected delegates."
                : "Payment reminders sent to all unpaid delegates.",
            sentCount: recipientsWithEmails.length,
          }

    setState(resultState)
    setIsSending(false)
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
          Send reminder emails directly from the portal.
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

        {isSending && (
          <div className="space-y-2 rounded-lg border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-center justify-between text-sm font-semibold text-amber-900">
              <span>Sending reminders...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-amber-900/80">Each selected delegate will be emailed one at a time.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
                  checked={selectionMode === "all" && recipientList.length > 0}
                  onCheckedChange={toggleAll}
                  disabled={!recipientList.length}
                />
                <label htmlFor="select-all" className="text-sm font-medium text-slate-800">
                  Send to all unpaid delegates
                </label>
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
                  {recipientList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-600">
                        There are no delegates currently marked as unpaid.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recipientList.map((recipient) => {
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

          <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <SubmitButton sendableCount={selectedEmailCount} resendConfigured={resendConfigured} isSending={isSending} />
            </div>
            <div className="space-y-1 text-xs text-slate-600 sm:text-right">
              {selectedCount > selectedEmailCount ? (
                <p className="text-amber-700">{selectedCount - selectedEmailCount} selected delegate(s) are missing email addresses.</p>
              ) : null}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
