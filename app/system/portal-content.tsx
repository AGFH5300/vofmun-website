"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Loader2, LogOut, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/utils/supabase/client"

export type SignupRecord = {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  payment_status: string | null
  payment_proof_url: string | null
  payment_proof_file_name: string | null
  payment_proof_uploaded_at: string | null
  created_at: string
}

type PortalContentProps = {
  onSignOut: () => Promise<void>
}

const formatPaymentStatus = (status: string | null) => {
  if (!status) return "Unpaid"

  switch (status) {
    case "paid":
      return "Paid"
    case "pending":
      return "Pending"
    default:
      return "Unpaid"
  }
}

const badgeVariantForStatus = (status: string | null) => {
  if (status === "paid") return "default" as const
  if (status === "pending") return "secondary" as const
  return "outline" as const
}

export function PortalContent({ onSignOut }: PortalContentProps) {
  const supabase = useMemo(() => createClient(), [])
  const [records, setRecords] = useState<SignupRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const fetchRecords = useCallback(async () => {
    const { data, error: queryError } = await supabase
      .from("users")
      .select(
        "id, first_name, last_name, email, phone, role, payment_status, payment_proof_url, payment_proof_file_name, payment_proof_uploaded_at, created_at",
      )
      .order("created_at", { ascending: false })

    if (queryError) {
      setError("Unable to load registrations. Please try again in a moment.")
      setLoading(false)
      return
    }

    setRecords((data as SignupRecord[]) ?? [])
    setError(null)
    setUpdateError(null)
    setLastUpdated(new Date())
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    void fetchRecords()

    const channel = supabase
      .channel("system-users")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        void fetchRecords()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchRecords, supabase])

  const totalRegistrations = records.length
  const paidRegistrations = records.filter((record) => record.payment_status === "paid").length
  const pendingRegistrations = records.filter((record) => record.payment_status === "pending").length

  const handleMarkAsPaid = useCallback(
    async (recordId: number) => {
      setUpdateError(null)
      setUpdatingId(recordId)

      try {
        const { error: updateError } = await supabase
          .from("users")
          .update({ payment_status: "paid" })
          .eq("id", recordId)

        if (updateError) {
          setUpdateError("Unable to update payment status. Please try again.")
          return
        }

        setRecords((previous) =>
          previous.map((record) =>
            record.id === recordId ? { ...record, payment_status: "paid" } : record,
          ),
        )
      } catch (cause) {
        console.error("Failed to update payment status", cause)
        setUpdateError("Unable to update payment status. Please try again.")
      } finally {
        setUpdatingId(null)
      }
    },
    [supabase],
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#B22222]/70">Live Operations</p>
          <h1 className="mt-2 text-3xl font-serif font-semibold text-[#B22222]">System</h1>
          <p className="mt-1 max-w-xl text-sm text-slate-600">
            Real-time overview of all delegate, chair, and admin registrations submitted through the public signup form.
          </p>
        </div>
        <form action={onSignOut}>
          <Button
            type="submit"
            variant="outline"
            className="gap-2 border-[#B22222]/40 text-[#B22222] hover:bg-[#B22222]/10 hover:text-[#B22222]"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </form>
      </div>

      <Card className="border-[#B22222]/30 bg-white text-slate-900 shadow-xl">
        <CardHeader className="flex flex-col gap-2 border-b border-[#B22222]/20 px-6 py-6">
          <CardTitle className="text-xl font-semibold text-[#B22222]">Registration Snapshot</CardTitle>
          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
            <span>
              Total: <strong className="text-slate-900">{totalRegistrations}</strong>
            </span>
            <span>
              Paid: <strong className="text-emerald-600">{paidRegistrations}</strong>
            </span>
            <span>
              Pending: <strong className="text-amber-500">{pendingRegistrations}</strong>
            </span>
            <button
              type="button"
              onClick={() => void fetchRecords()}
              className="inline-flex items-center gap-1 rounded-md border border-[#B22222]/30 px-2 py-1 text-xs text-[#B22222] transition hover:bg-[#B22222]/10"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            {lastUpdated && (
              <span className="text-xs text-slate-500">
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-6 pt-0">
          {updateError && <div className="px-6 pt-4 text-sm text-red-500">{updateError}</div>}
          {loading ? (
            <div className="flex justify-center py-16 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="px-6 py-10 text-center text-sm text-red-500">{error}</div>
          ) : records.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">No registrations found yet.</div>
          ) : (
            <Table className="min-w-full text-slate-900">
              <TableHeader>
                <TableRow className="border-[#B22222]/20">
                  <TableHead className="text-slate-500">Name</TableHead>
                  <TableHead className="text-slate-500">Email</TableHead>
                  <TableHead className="text-slate-500">Phone</TableHead>
                  <TableHead className="text-slate-500">Role</TableHead>
                  <TableHead className="text-slate-500">Payment</TableHead>
                  <TableHead className="text-slate-500">Proof</TableHead>
                  <TableHead className="text-slate-500">Submitted</TableHead>
                  <TableHead className="text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const proofAvailable = Boolean(record.payment_proof_url)

                  return (
                    <TableRow key={record.id} className="border-[#B22222]/10">
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {record.first_name} {record.last_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`mailto:${record.email}`}
                          className="text-[#B22222] underline-offset-2 hover:text-[#8B1A1A] hover:underline"
                        >
                          {record.email}
                        </Link>
                      </TableCell>
                      <TableCell className="text-slate-600">{record.phone}</TableCell>
                      <TableCell className="capitalize text-slate-700">{record.role}</TableCell>
                      <TableCell>
                        <Badge variant={badgeVariantForStatus(record.payment_status)}>
                          {formatPaymentStatus(record.payment_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {proofAvailable ? (
                          <Link
                            href={record.payment_proof_url ?? "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 underline-offset-2 hover:text-emerald-500 hover:underline"
                          >
                            {record.payment_proof_file_name ?? "View proof"}
                          </Link>
                        ) : (
                          <span className="text-slate-400">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500">
                        {new Date(record.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        {record.payment_status === "pending" ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#B22222]/30 text-[#B22222] hover:bg-[#B22222]/10"
                            disabled={updatingId === record.id}
                            onClick={() => void handleMarkAsPaid(record.id)}
                          >
                            {updatingId === record.id ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                Verifying...
                              </span>
                            ) : (
                              "Mark as paid"
                            )}
                          </Button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
