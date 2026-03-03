// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/utils/supabase/client"
import { AllocationStatus, allocationStatuses, type AllocationUserRow } from "../_lib/allocation-types"

type AllocationsPortalProps = {
  isAdmin: boolean
}

type EditableFields = {
  allocated_committee_code: string
  allocated_country_code: string
  allocation_status: AllocationStatus
}

const statusOptions: AllocationStatus[] = [...allocationStatuses]

export function AllocationsPortal({ isAdmin }: AllocationsPortalProps) {
  const [rows, setRows] = useState<AllocationUserRow[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | AllocationStatus>("all")
  const [committeeFilter, setCommitteeFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<"delegates" | "all">("delegates")
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<number | null>(null)
  const [drafts, setDrafts] = useState<Record<number, EditableFields>>({})

  const loadRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("users")
      .select(
        "id,first_name,last_name,email,role,school,grade,delegate_data,allocated_committee_code,allocated_country_code,allocation_status,updated_at",
      )
      .order("updated_at", { ascending: false })

    if (error) {
      toast.error("Failed to load allocations", { description: error.message })
      setLoading(false)
      return
    }

    const nextRows = (data ?? []).map((row) => ({
      ...row,
      allocation_status: (row.allocation_status ?? "pending") as AllocationStatus,
    })) as AllocationUserRow[]

    setRows(nextRows)
    setDrafts(
      Object.fromEntries(
        nextRows.map((row) => [
          row.id,
          {
            allocated_committee_code: row.allocated_committee_code ?? "",
            allocated_country_code: row.allocated_country_code ?? "",
            allocation_status: row.allocation_status ?? "pending",
          },
        ]),
      ),
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadRows()
  }, [loadRows])

  const committeeOptions = useMemo(() => {
    const values = new Set<string>()
    rows.forEach((row) => {
      const committee = row.delegate_data?.committee1?.trim()
      if (committee) values.add(committee)
    })
    return Array.from(values).sort((a, b) => a.localeCompare(b))
  }, [rows])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return rows.filter((row) => {
      if (roleFilter === "delegates" && row.role !== "delegate") return false
      if (statusFilter !== "all" && (row.allocation_status ?? "pending") !== statusFilter) return false
      if (committeeFilter !== "all" && (row.delegate_data?.committee1 ?? "") !== committeeFilter) return false
      if (!query) return true

      const haystack = [row.first_name, row.last_name, row.email, row.school ?? ""].join(" ").toLowerCase()
      return haystack.includes(query)
    })
  }, [committeeFilter, roleFilter, rows, search, statusFilter])

  const updateDraft = (id: number, field: keyof EditableFields, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {
          allocated_committee_code: "",
          allocated_country_code: "",
          allocation_status: "pending" as AllocationStatus,
        }),
        [field]: value,
      },
    }))
  }

  const saveAssignment = async (row: AllocationUserRow) => {
    const draft = drafts[row.id]
    if (!draft) return

    setSavingId(row.id)

    const payload = {
      userId: row.id,
      allocated_committee_code: draft.allocated_committee_code || null,
      allocated_country_code: draft.allocated_country_code || null,
      allocated_country: null,
      allocation_status: draft.allocation_status,
    }

    const response = await fetch("/api/system/allocations/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      toast.error("Failed to save allocation", {
        description: result?.error ?? "Unknown error",
      })
      setSavingId(null)
      return
    }

    toast.success("Allocation updated")
    await loadRows()
    setSavingId(null)
  }

  const unassign = async (row: AllocationUserRow) => {
    setSavingId(row.id)

    const response = await fetch("/api/system/allocations/unassign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: row.id }),
    })

    const result = await response.json().catch(() => null)

    if (!response.ok) {
      toast.error("Failed to unassign", {
        description: result?.error ?? "Unknown error",
      })
      setSavingId(null)
      return
    }

    toast.success("Delegate unassigned")
    await loadRows()
    setSavingId(null)
  }

  return (
    <Card className="border-orange-200 bg-white/95 shadow-xl">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">Allocations Portal</CardTitle>
            <CardDescription>
              Restricted editor for committee/country allocations only.
            </CardDescription>
          </div>
          <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
            <ShieldCheck className="mr-1 h-4 w-4" />
            {isAdmin ? "Admin access" : "Allocator access"}
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <Input
            placeholder="Search name, email, school"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as "all" | AllocationStatus)}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={committeeFilter} onValueChange={setCommitteeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Preferred committee 1" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All preferred committees</SelectItem>
              {committeeOptions.map((committee) => (
                <SelectItem key={committee} value={committee}>
                  {committee}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as "delegates" | "all")}>
            <SelectTrigger>
              <SelectValue placeholder="Role filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delegates">Delegates only</SelectItem>
              <SelectItem value="all">All roles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Button variant="outline" onClick={() => void loadRows()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>School</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Preference 1</TableHead>
                <TableHead>Preference 2</TableHead>
                <TableHead>Preference 3</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Committee code</TableHead>
                <TableHead>Country code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-20 text-center text-slate-500">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={13} className="h-20 text-center text-slate-500">
                    No matching registrations found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => {
                  const draft = drafts[row.id]
                  const isSaving = savingId === row.id

                  return (
                    <TableRow key={row.id}>
                      <TableCell>{`${row.first_name} ${row.last_name}`}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.school ?? "—"}</TableCell>
                      <TableCell>{row.grade ?? "—"}</TableCell>
                      <TableCell>{row.delegate_data?.committee1 ?? "—"}</TableCell>
                      <TableCell>{row.delegate_data?.committee2 ?? "—"}</TableCell>
                      <TableCell>{row.delegate_data?.committee3 ?? "—"}</TableCell>
                      <TableCell>{row.delegate_data?.experience ?? "—"}</TableCell>
                      <TableCell>
                        <Input
                          value={draft?.allocated_committee_code ?? ""}
                          onChange={(event) => updateDraft(row.id, "allocated_committee_code", event.target.value)}
                          disabled={isSaving}
                          className="min-w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={draft?.allocated_country_code ?? ""}
                          onChange={(event) => updateDraft(row.id, "allocated_country_code", event.target.value)}
                          disabled={isSaving}
                          className="min-w-24"
                        />
                      </TableCell>
                      <TableCell>
                        <Select
                          value={draft?.allocation_status ?? "pending"}
                          onValueChange={(value) => updateDraft(row.id, "allocation_status", value)}
                          disabled={isSaving}
                        >
                          <SelectTrigger className="min-w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {statusOptions.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>{new Date(row.updated_at).toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" onClick={() => void saveAssignment(row)} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => void unassign(row)}
                            disabled={isSaving}
                          >
                            Unassign
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
