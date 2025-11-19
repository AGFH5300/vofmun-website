"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Download, Loader2, LogOut, RefreshCw } from "lucide-react"
import * as XLSX from "xlsx"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/utils/supabase/client"

export type SignupRecord = {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  school: string | null
  payment_status: PaymentStatusValue | null
  payment_proof_url: string | null
  payment_proof_file_name: string | null
  payment_proof_uploaded_at: string | null
  delegate_data: { committee1?: string | null } | null
  chair_data: { committee1?: string | null } | null
  created_at: string
}

type SchoolDelegationRecord = {
  id: number
  school_name: string
  school_address: string
  school_email: string
  school_country: string
  director_name: string
  director_email: string
  director_phone: string
  num_faculty: number
  num_delegates: number
  additional_requests: string | null
  heard_about: string | null
  terms_accepted: boolean
  spreadsheet_file_name: string
  spreadsheet_url: string | null
  created_at: string
}

type PortalContentProps = {
  onSignOut: () => Promise<void>
}

type RegistrationView = "all" | "delegates" | "chairs" | "admins" | "school"

type PaymentStatusValue =
  | "unpaid"
  | "pending"
  | "paid"
  | "flagged"
  | "need_more_info"
  | "fake"
  | "refunded"

const statusOptions: { value: PaymentStatusValue; label: string }[] = [
  { value: "paid", label: "Confirmed" },
  { value: "refunded", label: "Refunded" },
  { value: "flagged", label: "Flagged" },
  { value: "need_more_info", label: "Need more info" },
  { value: "fake", label: "Fake" },
  { value: "pending", label: "Pending review" },
  { value: "unpaid", label: "Unpaid" },
]

const formatPaymentStatus = (status: PaymentStatusValue | null) => {
  if (!status) return "Unpaid"

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

const badgeVariantForStatus = (status: PaymentStatusValue | null) => {
  switch (status) {
    case "paid":
      return "default" as const
    case "pending":
    case "need_more_info":
      return "secondary" as const
    case "flagged":
    case "fake":
      return "outline" as const
    case "refunded":
      return "secondary" as const
    default:
      return "outline" as const
  }
}

const badgeClassNameForStatus = (status: PaymentStatusValue | null) => {
  switch (status) {
    case "flagged":
    case "fake":
      return "border border-[#B22222]/30 bg-white text-[#B22222]"
    default:
      return undefined
  }
}

export function PortalContent({ onSignOut }: PortalContentProps) {
  const supabase = useMemo(() => createClient(), [])
  const [records, setRecords] = useState<SignupRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [schoolDelegations, setSchoolDelegations] = useState<SchoolDelegationRecord[]>([])
  const [schoolLoading, setSchoolLoading] = useState(true)
  const [schoolError, setSchoolError] = useState<string | null>(null)
  const [schoolLastUpdated, setSchoolLastUpdated] = useState<Date | null>(null)
  const [activeView, setActiveView] = useState<RegistrationView>("all")

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const { data, error: queryError } = await supabase
      .from("users")
      .select(
        "id, first_name, last_name, email, phone, role, school, payment_status, payment_proof_url, payment_proof_file_name, payment_proof_uploaded_at, delegate_data, chair_data, created_at",
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

  const fetchSchoolDelegations = useCallback(async () => {
    setSchoolLoading(true)
    const { data, error: queryError } = await supabase
      .from("school_delegations")
      .select(
        "id, school_name, school_address, school_email, school_country, director_name, director_email, director_phone, num_faculty, num_delegates, additional_requests, heard_about, terms_accepted, spreadsheet_file_name, spreadsheet_url, created_at",
      )
      .order("created_at", { ascending: false })

    if (queryError) {
      setSchoolError("Unable to load school delegations. Please try again in a moment.")
      setSchoolLoading(false)
      return
    }

    setSchoolDelegations((data as SchoolDelegationRecord[]) ?? [])
    setSchoolError(null)
    setSchoolLastUpdated(new Date())
    setSchoolLoading(false)
  }, [supabase])

  useEffect(() => {
    void fetchRecords()
    void fetchSchoolDelegations()

    const usersChannel = supabase
      .channel("system-users")
      .on("postgres_changes", { event: "*", schema: "public", table: "users" }, () => {
        void fetchRecords()
      })
      .subscribe()

    const delegationsChannel = supabase
      .channel("system-school-delegations")
      .on("postgres_changes", { event: "*", schema: "public", table: "school_delegations" }, () => {
        void fetchSchoolDelegations()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(usersChannel)
      void supabase.removeChannel(delegationsChannel)
    }
  }, [fetchRecords, fetchSchoolDelegations, supabase])

  const totalRegistrations = records.length
  const paidRegistrations = records.filter((record) => record.payment_status === "paid").length
  const pendingRegistrations = records.filter((record) => record.payment_status === "pending").length
  const delegateRegistrations = useMemo(
    () => records.filter((record) => record.role === "delegate"),
    [records],
  )
  const chairRegistrations = useMemo(
    () => records.filter((record) => record.role === "chair"),
    [records],
  )
  const adminRegistrations = useMemo(
    () => records.filter((record) => record.role === "admin"),
    [records],
  )
  const schoolDelegationTotal = schoolDelegations.length

  const displayedLastUpdated = activeView === "school" ? schoolLastUpdated : lastUpdated

  const handleRefresh = useCallback(() => {
    void fetchRecords()
    void fetchSchoolDelegations()
  }, [fetchRecords, fetchSchoolDelegations])

  const handleStatusChange = useCallback(
    async (recordId: number, nextStatus: PaymentStatusValue) => {
      setUpdateError(null)
      setUpdatingId(recordId)

      try {
        const { error: updateError } = await supabase
          .from("users")
          .update({ payment_status: nextStatus })
          .eq("id", recordId)

        if (updateError) {
          setUpdateError("Unable to update payment status. Please try again.")
          return
        }

        setRecords((previous) =>
          previous.map((record) =>
            record.id === recordId ? { ...record, payment_status: nextStatus } : record,
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

  const exportToXlsx = useCallback(() => {
    if (!records.length) return

    const rows = records.map((record) => ({
      Name: `${record.first_name} ${record.last_name}`.trim(),
      Email: record.email,
      Phone: record.phone,
      School: record.school ?? "",
      Role: record.role,
      CommitteePreference1: getPrimaryCommitteePreference(record) ?? "",
      PaymentStatus: formatPaymentStatus(record.payment_status),
      ProofFileName: record.payment_proof_file_name ?? "",
      ProofUrl: record.payment_proof_url ?? "",
      SubmittedAt: new Date(record.created_at).toLocaleString(),
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations")

    const dateStamp = new Date().toISOString().split("T")[0]
    XLSX.writeFile(workbook, `vofmun-registrations-${dateStamp}.xlsx`)
  }, [records])

  const renderUserTab = (recordsToDisplay: SignupRecord[], emptyMessage: string) => {
    if (loading) {
      return (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    }

    if (error) {
      return <div className="px-6 py-10 text-center text-sm text-red-500">{error}</div>
    }

    if (records.length === 0) {
      return <div className="px-6 py-10 text-center text-sm text-slate-500">No registrations found yet.</div>
    }

    if (recordsToDisplay.length === 0) {
      return <div className="px-6 py-10 text-center text-sm text-slate-500">{emptyMessage}</div>
    }

    return (
      <Table className="min-w-full text-slate-900">
        <TableHeader>
          <TableRow className="border-[#B22222]/20">
            <TableHead className="text-slate-500">Name</TableHead>
            <TableHead className="text-slate-500">Email</TableHead>
            <TableHead className="text-slate-500">Phone</TableHead>
            <TableHead className="text-slate-500">School</TableHead>
            <TableHead className="text-slate-500">Role</TableHead>
            <TableHead className="text-slate-500">Committee pref #1</TableHead>
            <TableHead className="text-slate-500">Payment</TableHead>
            <TableHead className="text-slate-500">Proof</TableHead>
            <TableHead className="text-slate-500">Submitted</TableHead>
            <TableHead className="text-slate-500">Review status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recordsToDisplay.map((record) => {
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
                <TableCell className="text-slate-600">{record.school ?? "—"}</TableCell>
                <TableCell className="capitalize text-slate-700">{record.role}</TableCell>
                <TableCell className="text-slate-700">{getPrimaryCommitteePreference(record) ?? "—"}</TableCell>
                <TableCell>
                  <Badge
                    variant={badgeVariantForStatus(record.payment_status)}
                    className={badgeClassNameForStatus(record.payment_status)}
                  >
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
                  <Select
                    value={(record.payment_status ?? "unpaid") as PaymentStatusValue}
                    onValueChange={(value) => void handleStatusChange(record.id, value as PaymentStatusValue)}
                    disabled={updatingId === record.id}
                  >
                    <SelectTrigger className="w-[170px] border-[#B22222]/40 text-left text-sm focus:ring-[#B22222]">
                      {updatingId === record.id ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" /> Updating...
                        </span>
                      ) : (
                        <SelectValue placeholder="Set status" />
                      )}
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    )
  }

  const renderSchoolTab = () => {
    if (schoolLoading) {
      return (
        <div className="flex justify-center py-16 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )
    }

    if (schoolError) {
      return <div className="px-6 py-10 text-center text-sm text-red-500">{schoolError}</div>
    }

    if (schoolDelegations.length === 0) {
      return <div className="px-6 py-10 text-center text-sm text-slate-500">No school delegation submissions yet.</div>
    }

    return (
      <Table className="min-w-full text-slate-900">
        <TableHeader>
          <TableRow className="border-[#B22222]/20">
            <TableHead className="text-slate-500">School</TableHead>
            <TableHead className="text-slate-500">Country</TableHead>
            <TableHead className="text-slate-500">Director</TableHead>
            <TableHead className="text-slate-500">Delegates</TableHead>
            <TableHead className="text-slate-500">Faculty</TableHead>
            <TableHead className="text-slate-500">Requests</TableHead>
            <TableHead className="text-slate-500">Heard about</TableHead>
            <TableHead className="text-slate-500">Spreadsheet</TableHead>
            <TableHead className="text-slate-500">Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schoolDelegations.map((record) => (
            <TableRow key={record.id} className="border-[#B22222]/10">
              <TableCell>
                <div className="font-medium text-slate-900">{record.school_name}</div>
                <div className="text-sm text-slate-500">{record.school_email}</div>
              </TableCell>
              <TableCell className="text-slate-600">{record.school_country}</TableCell>
              <TableCell>
                <div className="font-medium text-slate-900">{record.director_name}</div>
                <Link
                  href={`mailto:${record.director_email}`}
                  className="text-sm text-[#B22222] underline-offset-2 hover:text-[#8B1A1A] hover:underline"
                >
                  {record.director_email}
                </Link>
                <div className="text-sm text-slate-500">{record.director_phone}</div>
              </TableCell>
              <TableCell className="text-slate-700">{record.num_delegates}</TableCell>
              <TableCell className="text-slate-700">{record.num_faculty}</TableCell>
              <TableCell className="text-sm text-slate-600">
                {record.additional_requests ? record.additional_requests : "—"}
              </TableCell>
              <TableCell className="text-sm text-slate-600">{record.heard_about ?? "—"}</TableCell>
              <TableCell>
                {record.spreadsheet_url ? (
                  <Link
                    href={record.spreadsheet_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 underline-offset-2 hover:text-emerald-500 hover:underline"
                  >
                    {record.spreadsheet_file_name}
                  </Link>
                ) : (
                  <span className="text-slate-400">Not available</span>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

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
            <span>
              Delegates: <strong className="text-slate-900">{delegateRegistrations.length}</strong>
            </span>
            <span>
              Chairs: <strong className="text-slate-900">{chairRegistrations.length}</strong>
            </span>
            <span>
              Admins: <strong className="text-slate-900">{adminRegistrations.length}</strong>
            </span>
            <span>
              Schools: <strong className="text-slate-900">{schoolDelegationTotal}</strong>
            </span>
            <button
              type="button"
              onClick={() => handleRefresh()}
              className="inline-flex items-center gap-1 rounded-md border border-[#B22222]/30 px-2 py-1 text-xs text-[#B22222] transition hover:bg-[#B22222]/10"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <Button
              type="button"
              variant="outline"
              className="inline-flex items-center gap-1 border-[#B22222]/30 text-xs text-[#B22222] hover:bg-[#B22222]/10"
              onClick={() => exportToXlsx()}
              disabled={records.length === 0}
            >
              <Download className="h-3.5 w-3.5" /> Export XLSX
            </Button>
            {displayedLastUpdated && (
              <span className="text-xs text-slate-500">
                Updated {displayedLastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-6 pt-0">
          <Tabs
            value={activeView}
            onValueChange={(value) => setActiveView(value as RegistrationView)}
            className="space-y-4"
          >
            <div className="px-6 pt-4">
              <TabsList className="flex flex-wrap gap-2 bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="rounded-full border border-[#B22222]/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#B22222] data-[state=active]:bg-[#B22222]/10"
                >
                  All signups
                </TabsTrigger>
                <TabsTrigger
                  value="delegates"
                  className="rounded-full border border-[#B22222]/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#B22222] data-[state=active]:bg-[#B22222]/10"
                >
                  Delegates
                </TabsTrigger>
                <TabsTrigger
                  value="chairs"
                  className="rounded-full border border-[#B22222]/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#B22222] data-[state=active]:bg-[#B22222]/10"
                >
                  Chairs
                </TabsTrigger>
                <TabsTrigger
                  value="admins"
                  className="rounded-full border border-[#B22222]/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#B22222] data-[state=active]:bg-[#B22222]/10"
                >
                  Admins
                </TabsTrigger>
                <TabsTrigger
                  value="school"
                  className="rounded-full border border-[#B22222]/30 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#B22222] data-[state=active]:bg-[#B22222]/10"
                >
                  School delegations
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="px-0">
              {updateError && <div className="px-6 pt-0 text-sm text-red-500">{updateError}</div>}
              {renderUserTab(records, "No registrations found yet.")}
            </TabsContent>
            <TabsContent value="delegates" className="px-0">
              {updateError && <div className="px-6 pt-0 text-sm text-red-500">{updateError}</div>}
              {renderUserTab(delegateRegistrations, "No delegate registrations yet.")}
            </TabsContent>
            <TabsContent value="chairs" className="px-0">
              {updateError && <div className="px-6 pt-0 text-sm text-red-500">{updateError}</div>}
              {renderUserTab(chairRegistrations, "No chair applications yet.")}
            </TabsContent>
            <TabsContent value="admins" className="px-0">
              {updateError && <div className="px-6 pt-0 text-sm text-red-500">{updateError}</div>}
              {renderUserTab(adminRegistrations, "No admin applications yet.")}
            </TabsContent>
            <TabsContent value="school" className="px-0">
              {renderSchoolTab()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

function getPrimaryCommitteePreference(record: SignupRecord) {
  if (record.role === "delegate") {
    return record.delegate_data?.committee1 ?? null
  }

  if (record.role === "chair") {
    return record.chair_data?.committee1 ?? null
  }

  return null
}
