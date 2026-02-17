"use client"

import { type FormEvent, useEffect, useMemo, useState } from "react"
import { AlertCircle, CheckCircle2, Loader2, MailWarning, Send, Sparkles } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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

type ReminderFormState = {
  status: "idle" | "success" | "error"
  message?: string
  sentCount?: number
  failedEmails?: string[]
}

type ProgressState = {
  isActive: boolean
  total: number
  processed: number
  sent: number
  failed: number
  skipped: number
  latest?: { name: string; email: string | null; status: "sent" | "failed" | "skipped"; error?: string }
}

type ReminderFormProps = {
  eligibleCount: number
  resendConfigured: boolean
  recipients: EligibleRecipient[]
}

export function PaymentReminderForm({ eligibleCount, recipients, resendConfigured }: ReminderFormProps) {
  const [formState, setFormState] = useState<ReminderFormState>({ status: "idle" })
  const [selectedIds, setSelectedIds] = useState<number[]>(() => recipients.map((recipient) => recipient.id))
  const [recipientList, setRecipientList] = useState<EligibleRecipient[]>(recipients)
  const [isSending, setIsSending] = useState(false)
  const [activityFeed, setActivityFeed] = useState<string[]>([])
  const [progress, setProgress] = useState<ProgressState>({
    isActive: false,
    total: 0,
    processed: 0,
    sent: 0,
    failed: 0,
    skipped: 0,
  })

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

  const progressPercent = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0

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

  const addActivity = (message: string) => {
    setActivityFeed((prev) => [message, ...prev].slice(0, 8))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setFormState({ status: "idle" })
    setActivityFeed([])
    setIsSending(true)
    setProgress({ isActive: true, total: 0, processed: 0, sent: 0, failed: 0, skipped: 0 })

    try {
      const response = await fetch("/system/payment-reminders/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectionMode,
          recipientIds: selectedIds,
        }),
      })

      if (!response.ok || !response.body) {
        const errorBody = await response.json().catch(() => null)
        setFormState({
          status: "error",
          message: errorBody?.message ?? "Unable to send reminders right now.",
        })
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { value, done } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() ?? ""

        for (const line of lines) {
          if (!line.trim()) continue

          const payload = JSON.parse(line) as
            | { type: "start"; total: number; message: string }
            | {
                type: "progress"
                processed: number
                total: number
                sent: number
                failed: number
                skipped: number
                recipient: { name: string; email: string | null }
                status: "sent" | "failed" | "skipped"
                error?: string
              }
            | {
                type: "complete"
                status: "success" | "error"
                message: string
                sentCount: number
                failedEmails: string[]
              }

          if (payload.type === "start") {
            setProgress((prev) => ({ ...prev, total: payload.total, isActive: true }))
            addActivity(payload.message)
          }

          if (payload.type === "progress") {
            setProgress({
              isActive: true,
              total: payload.total,
              processed: payload.processed,
              sent: payload.sent,
              failed: payload.failed,
              skipped: payload.skipped,
              latest: {
                name: payload.recipient.name,
                email: payload.recipient.email,
                status: payload.status,
                error: payload.error,
              },
            })

            const statusEmoji = payload.status === "sent" ? "✅" : payload.status === "failed" ? "❌" : "⚠️"
            addActivity(
              `${statusEmoji} ${payload.recipient.name} (${payload.recipient.email ?? "no email"}) — ${payload.status}` +
                (payload.error ? `: ${payload.error}` : ""),
            )
          }

          if (payload.type === "complete") {
            setFormState({
              status: payload.status,
              message: payload.message,
              sentCount: payload.sentCount,
              failedEmails: payload.failedEmails,
            })
            setProgress((prev) => ({ ...prev, isActive: false }))
          }
        }
      }
    } catch {
      setFormState({
        status: "error",
        message: "Connection interrupted while sending reminders.",
      })
    } finally {
      setIsSending(false)
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

        {(isSending || progress.total > 0) && (
          <div className="overflow-hidden rounded-xl border border-[#B22222]/20 bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Sparkles className="h-4 w-4 text-[#B22222]" />
                Live email delivery
              </p>
              <span className="text-xs font-semibold text-slate-700">{progressPercent}% complete</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-white/80 shadow-inner">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#B22222] via-orange-500 to-amber-400 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-700 sm:grid-cols-4">
              <p>Processed: {progress.processed}/{progress.total}</p>
              <p>Sent: {progress.sent}</p>
              <p>Failed: {progress.failed}</p>
              <p>Skipped: {progress.skipped}</p>
            </div>
            {progress.latest ? (
              <p className="mt-2 text-xs text-slate-800">
                Last update: <span className="font-semibold">{progress.latest.name}</span>
                {progress.latest.email ? ` (${progress.latest.email})` : ""} — {progress.latest.status}
                {progress.latest.error ? ` (${progress.latest.error})` : ""}
              </p>
            ) : null}
          </div>
        )}

        {activityFeed.length > 0 && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Live activity</p>
            <ul className="space-y-1 text-xs text-slate-700">
              {activityFeed.map((entry, index) => (
                <li key={`${entry}-${index}`} className="animate-in fade-in-50 duration-300">{entry}</li>
              ))}
            </ul>
          </div>
        )}

        {formState.message && (
          <Alert variant={formState.status === "success" ? "default" : "destructive"}>
            {formState.status === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <AlertTitle className="text-sm font-semibold">
              {formState.status === "success" ? "Reminders sent" : "Action needed"}
            </AlertTitle>
            <AlertDescription className="text-sm text-slate-700">
              {formState.message}
              {typeof formState.sentCount === "number" && formState.sentCount > 0
                ? ` (${formState.sentCount} email${formState.sentCount === 1 ? "" : "s"} sent)`
                : null}
              {formState.failedEmails && formState.failedEmails.length > 0 ? (
                <>
                  <br />
                  <span className="mt-2 inline-block font-medium text-[#7a1414]">
                    Failed emails: {formState.failedEmails.join(", ")}
                  </span>
                </>
              ) : null}
            </AlertDescription>
          </Alert>
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
                  disabled={!recipientList.length || isSending}
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
                              disabled={isSending}
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
            <Button
              type="submit"
              disabled={isSending || selectedEmailCount === 0 || !resendConfigured}
              className="w-full bg-[#B22222] text-white hover:bg-[#9b1d1d] sm:w-auto"
            >
              {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              {!resendConfigured
                ? "Email setup required"
                : !selectedEmailCount
                  ? "No emailable delegates"
                  : isSending
                    ? "Sending reminders..."
                    : `Send reminder to ${selectedEmailCount} delegate${selectedEmailCount === 1 ? "" : "s"}`}
            </Button>
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
