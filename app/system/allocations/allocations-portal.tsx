// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, Columns3, Loader2, LogOut, RefreshCw, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { createClient } from "@/utils/supabase/client"
import { type AllocationUserRow } from "../_lib/allocation-types"
import {
  allocationCommitteeCodes,
  getAllocationOptionsForCommittee,
  normalizeCommitteeCode,
} from "../_lib/committee-allocation-options"
import { formatAllocatorDisplay, getAllocatorLabelFromEmail } from "../_lib/allocator-label"

type AllocationsPortalProps = {
  isAdmin: boolean
  userEmail: string
  onSignOut: () => Promise<void>
}

type EditableFields = {
  allocated_committee_code: string
  allocated_country_code: string
}

type ColumnKey =
  | "name"
  | "email"
  | "school"
  | "grade"
  | "preference1"
  | "preference2"
  | "preference3"
  | "experience"
  | "committeeCode"
  | "countryCode"
  | "allocatedBy"
  | "updated"

const ALL_COLUMNS: { key: ColumnKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "school", label: "School" },
  { key: "grade", label: "Grade" },
  { key: "preference1", label: "Preference 1" },
  { key: "preference2", label: "Preference 2" },
  { key: "preference3", label: "Preference 3" },
  { key: "experience", label: "Experience" },
  { key: "committeeCode", label: "Committee code" },
  { key: "countryCode", label: "Country code" },
  { key: "allocatedBy", label: "Allocated by" },
  { key: "updated", label: "Updated" },
]

const DEFAULT_COLUMNS: ColumnKey[] = ALL_COLUMNS.map((column) => column.key)
const COLUMN_COOKIE_NAME = "system_allocations_visible_columns"
const COLUMN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

const sanitizeColumns = (columns: unknown): ColumnKey[] => {
  if (!Array.isArray(columns)) return DEFAULT_COLUMNS

  const allowed = new Set<ColumnKey>(ALL_COLUMNS.map((column) => column.key))
  const cleaned = columns.filter((column): column is ColumnKey => typeof column === "string" && allowed.has(column as ColumnKey))

  if (!cleaned.includes("allocatedBy")) {
    cleaned.push("allocatedBy")
  }

  return cleaned.length > 0 ? cleaned : DEFAULT_COLUMNS
}

const getCookieValue = (cookieName: string) => {
  if (typeof document === "undefined") return null

  const prefix = `${cookieName}=`
  const cookie = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix))

  if (!cookie) return null
  return cookie.slice(prefix.length)
}

function SearchableSelect({
  value,
  onValueChange,
  placeholder,
  options,
  searchPlaceholder,
  disabled,
}: {
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  options: { value: string; label: string; disabled?: boolean }[]
  searchPlaceholder: string
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="min-w-44 justify-between" disabled={disabled}>
          <span className="truncate text-left">{selected?.label ?? placeholder}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9" />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  disabled={option.disabled}
                  onSelect={() => {
                    if (option.disabled) return
                    onValueChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  <span className={cn(option.disabled && "text-slate-400")}>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function AllocationsPortal({ isAdmin, userEmail, onSignOut }: AllocationsPortalProps) {
  const [rows, setRows] = useState<AllocationUserRow[]>([])
  const [search, setSearch] = useState("")
  const [committeeFilter, setCommitteeFilter] = useState<string>("all")
  const [selectedAllocationCommittee, setSelectedAllocationCommittee] = useState<string | null>(null)
  const [nameSort, setNameSort] = useState<"name_asc" | "name_desc">("name_asc")
  const [allocationSort, setAllocationSort] = useState<"default" | "unallocated_first">("default")
  const [visibleColumns, setVisibleColumns] = useState<ColumnKey[]>(DEFAULT_COLUMNS)
  const [columnsHydrated, setColumnsHydrated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set())
  const [drafts, setDrafts] = useState<Record<number, EditableFields>>({})
  const saveTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({})

  const loadRows = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("users")
      .select(
        "id,first_name,last_name,email,role,payment_status,school,grade,delegate_data,allocated_committee_code,allocated_country_code,allocated_country,allocated_by_email,allocation_status,updated_at",
      )
      .order("updated_at", { ascending: false })

    if (error) {
      toast.error("Failed to load allocations", { description: error.message })
      setLoading(false)
      return
    }

    const nextRows = data as AllocationUserRow[]

    setRows(nextRows)
    setDrafts(
      Object.fromEntries(
        nextRows.map((row) => [
          row.id,
          {
            allocated_committee_code: row.allocated_committee_code ?? "",
            allocated_country_code: row.allocated_country ?? row.allocated_country_code ?? "",
          },
        ]),
      ),
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    void loadRows()
  }, [loadRows])

  useEffect(
    () => () => {
      Object.values(saveTimers.current).forEach((timer) => clearTimeout(timer))
    },
    [],
  )

  useEffect(() => {
    if (typeof document === "undefined") return

    const emailKey = userEmail.trim().toLowerCase()
    if (!emailKey) {
      setColumnsHydrated(true)
      return
    }

    try {
      const rawCookie = getCookieValue(COLUMN_COOKIE_NAME)
      if (!rawCookie) {
        setColumnsHydrated(true)
        return
      }

      const parsed = JSON.parse(decodeURIComponent(rawCookie)) as Record<string, unknown>
      const userColumns = sanitizeColumns(parsed[emailKey])
      setVisibleColumns(userColumns)
    } catch (cause) {
      console.warn("Failed to restore allocations column preferences", cause)
    } finally {
      setColumnsHydrated(true)
    }
  }, [userEmail])

  useEffect(() => {
    if (typeof document === "undefined" || !columnsHydrated) return

    const emailKey = userEmail.trim().toLowerCase()
    if (!emailKey) return

    try {
      const rawCookie = getCookieValue(COLUMN_COOKIE_NAME)
      const parsed = rawCookie ? (JSON.parse(decodeURIComponent(rawCookie)) as Record<string, unknown>) : {}
      const nextPreferences = {
        ...parsed,
        [emailKey]: visibleColumns,
      }
      document.cookie = `${COLUMN_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(nextPreferences))}; path=/; max-age=${COLUMN_COOKIE_MAX_AGE_SECONDS}; samesite=lax`
    } catch (cause) {
      console.warn("Failed to persist allocations column preferences", cause)
    }
  }, [columnsHydrated, userEmail, visibleColumns])

  const eligibleRows = useMemo(() => {
    return rows.filter((row) => row.role === "delegate" && (row.payment_status ?? "").toLowerCase() === "paid")
  }, [rows])

    const committeeOptions = useMemo(() => {
    const allowedCommittees = new Set<string>(allocationCommitteeCodes)
    const values = new Set<string>()

    eligibleRows.forEach((row) => {
      ;[row.delegate_data?.committee1, row.delegate_data?.committee2, row.delegate_data?.committee3, row.allocated_committee_code]
        .filter(Boolean)
        .forEach((committee) => {
          const normalized = normalizeCommitteeCode(String(committee))
          if (allowedCommittees.has(normalized)) {
            values.add(normalized)
          }
        })
    })

    return Array.from(values).filter(Boolean).sort((a, b) => a.localeCompare(b))
  }, [eligibleRows])

  const takenOptionsByCommittee = useMemo(() => {
    const map = new Map<string, Set<string>>()

    eligibleRows.forEach((row) => {
      const draft = drafts[row.id]
      const committeeCode = normalizeCommitteeCode(draft?.allocated_committee_code ?? row.allocated_committee_code)
      const allocatedOption = (draft?.allocated_country_code ?? row.allocated_country ?? row.allocated_country_code)?.trim()

      if (!committeeCode || !allocatedOption) return

      if (!map.has(committeeCode)) {
        map.set(committeeCode, new Set<string>())
      }

      map.get(committeeCode)?.add(allocatedOption)
    })

    return map
  }, [drafts, eligibleRows])

  const allocatedDelegatesByCommittee = useMemo(() => {
    const map = new Map<string, AllocationUserRow[]>()

    eligibleRows.forEach((row) => {
      const draft = drafts[row.id]
      const committeeCode = normalizeCommitteeCode(draft?.allocated_committee_code ?? row.allocated_committee_code)
      const allocatedOption = (draft?.allocated_country_code ?? row.allocated_country ?? row.allocated_country_code)?.trim()

      if (!committeeCode || !allocatedOption) return

      if (!map.has(committeeCode)) {
        map.set(committeeCode, [])
      }

      map.get(committeeCode)?.push({
        ...row,
        allocated_committee_code: committeeCode,
        allocated_country: allocatedOption,
        allocated_country_code: allocatedOption,
      })
    })

    return Array.from(map.entries())
      .sort(([committeeA], [committeeB]) => committeeA.localeCompare(committeeB))
      .map(([committee, delegates]) => ({
        committee,
        delegates: delegates.sort((a, b) => {
          const firstNameCompare = a.first_name.localeCompare(b.first_name)
          if (firstNameCompare !== 0) return firstNameCompare
          return a.last_name.localeCompare(b.last_name)
        }),
      }))
  }, [drafts, eligibleRows])

  useEffect(() => {
    if (allocatedDelegatesByCommittee.length === 0) {
      setSelectedAllocationCommittee(null)
      return
    }

    const selectedStillExists = allocatedDelegatesByCommittee.some(
      (entry) => entry.committee === selectedAllocationCommittee,
    )

    if (!selectedStillExists) {
      setSelectedAllocationCommittee(null)
    }
  }, [allocatedDelegatesByCommittee, selectedAllocationCommittee])

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase()

    return eligibleRows.filter((row) => {
      if (committeeFilter !== "all" && (row.delegate_data?.committee1 ?? "") !== committeeFilter) return false
      if (!query) return true

      const haystack = [row.first_name, row.last_name, row.email, row.school ?? ""].join(" ").toLowerCase()
      return haystack.includes(query)
    })
  }, [committeeFilter, eligibleRows, search])

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((a, b) => {
      if (allocationSort === "unallocated_first") {
        const aDraft = drafts[a.id]
        const bDraft = drafts[b.id]

        const isAAllocated = Boolean(aDraft?.allocated_committee_code ?? a.allocated_committee_code) &&
          Boolean(aDraft?.allocated_country_code ?? a.allocated_country ?? a.allocated_country_code)
        const isBAllocated = Boolean(bDraft?.allocated_committee_code ?? b.allocated_committee_code) &&
          Boolean(bDraft?.allocated_country_code ?? b.allocated_country ?? b.allocated_country_code)

        if (isAAllocated !== isBAllocated) {
          return isAAllocated ? 1 : -1
        }
      }

      const firstNameCompare = a.first_name.localeCompare(b.first_name)
      const lastNameCompare = a.last_name.localeCompare(b.last_name)
      const result = firstNameCompare !== 0 ? firstNameCompare : lastNameCompare
      return nameSort === "name_asc" ? result : -result
    })
  }, [allocationSort, drafts, filteredRows, nameSort])

  const getAuthorizationHeader = useCallback(async (): Promise<Record<string, string>> => {
    const supabase = createClient()
    const { data } = await supabase.auth.getSession()
    const accessToken = data.session?.access_token

    if (!accessToken) return {}

    return { Authorization: `Bearer ${accessToken}` }
  }, [])

  const saveAssignment = useCallback(async (rowId: number, draftOverride?: EditableFields) => {
    const row = rows.find((item) => item.id === rowId)
    const draft = draftOverride ?? drafts[rowId]
    if (!row || !draft) return

    const nextStatus = draft.allocated_committee_code && draft.allocated_country_code ? "allocated" : "pending"

    setSavingIds((prev) => new Set(prev).add(rowId))

    try {
      const authHeader = await getAuthorizationHeader()
      const response = await fetch("/api/system/allocations/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          userId: rowId,
          allocated_committee_code: draft.allocated_committee_code || null,
          allocated_country_code: null,
          allocated_country: draft.allocated_country_code || null,
          allocation_status: nextStatus,
        }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        toast.error("Failed to autosave allocation", {
          description: result?.error ?? "Unknown error",
        })
        return
      }

      setRows((prev) =>
        prev.map((entry) =>
          entry.id === rowId
            ? {
                ...entry,
                allocated_committee_code: draft.allocated_committee_code || null,
                allocated_country_code: null,
                allocated_country: draft.allocated_country_code || null,
                allocated_by_email: getAllocatorLabelFromEmail(userEmail, isAdmin) || null,
                allocation_status: nextStatus,
                updated_at: new Date().toISOString(),
              }
            : entry,
        ),
      )
    } catch (error) {
      toast.error("Failed to autosave allocation", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(rowId)
        return next
      })
    }
  }, [drafts, getAuthorizationHeader, isAdmin, rows, userEmail])

  const queueAutosave = useCallback(
    (id: number, draft: EditableFields) => {
      const previousTimer = saveTimers.current[id]
      if (previousTimer) clearTimeout(previousTimer)

      saveTimers.current[id] = setTimeout(() => {
        void saveAssignment(id, draft)
      }, 500)
    },
    [saveAssignment],
  )

  const updateDraft = (id: number, field: keyof EditableFields, value: string) => {
    let nextDraft: EditableFields | null = null

    setDrafts((prev) => {
      const calculatedDraft = {
        ...(prev[id] ?? {
          allocated_committee_code: "",
          allocated_country_code: "",
        }),
        [field]: value,
        ...(field === "allocated_committee_code" ? { allocated_country_code: "" } : {}),
      }

      nextDraft = calculatedDraft

      return {
        ...prev,
        [id]: calculatedDraft,
      }
    })

    if (nextDraft) {
      queueAutosave(id, nextDraft)
    }
  }

  const unassign = async (row: AllocationUserRow) => {
    setSavingIds((prev) => new Set(prev).add(row.id))

    try {
      const authHeader = await getAuthorizationHeader()
      const response = await fetch("/api/system/allocations/unassign", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ userId: row.id }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        toast.error("Failed to unassign", {
          description: result?.error ?? "Unknown error",
        })
        return
      }

      setDrafts((prev) => ({
        ...prev,
        [row.id]: {
          allocated_committee_code: "",
          allocated_country_code: "",
        },
      }))
      setRows((prev) =>
        prev.map((entry) =>
          entry.id === row.id
            ? {
                ...entry,
                allocated_committee_code: null,
                allocated_country_code: null,
                allocated_country: null,
                allocated_by_email: null,
                allocation_status: "unallocated",
                updated_at: new Date().toISOString(),
              }
            : entry,
        ),
      )
      toast.success("Delegate unassigned")
    } catch (error) {
      toast.error("Failed to unassign", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setSavingIds((prev) => {
        const next = new Set(prev)
        next.delete(row.id)
        return next
      })
    }
  }

  const toggleColumn = (column: ColumnKey) => {
    setVisibleColumns((prev) => {
      if (prev.includes(column)) {
        if (prev.length === 1) return prev
        return prev.filter((item) => item !== column)
      }
      return [...prev, column]
    })
  }

  const isVisible = (column: ColumnKey) => visibleColumns.includes(column)

  return (
    <Card className="border-orange-200 bg-white/95 shadow-xl">
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-2xl">Allocations Portal</CardTitle>
            <CardDescription>
              Restricted editor for committee/country allocations only. Changes are autosaved.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="outline">
                <Link href="/system">Go to main system</Link>
              </Button>
            )}
            <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
              <ShieldCheck className="mr-1 h-4 w-4" />
              {isAdmin ? "Admin access" : "Allocator access"}
            </Badge>
            <form action={onSignOut}>
              <Button type="submit" variant="outline">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-5">
          <Input
            placeholder="Search name, email, school"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

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

          <Select value={nameSort} onValueChange={(value) => setNameSort(value as "name_asc" | "name_desc")}>
            <SelectTrigger>
              <SelectValue placeholder="Name order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name (A-Z)</SelectItem>
              <SelectItem value="name_desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={allocationSort}
            onValueChange={(value) => setAllocationSort(value as "default" | "unallocated_first")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Allocation order" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default allocation order</SelectItem>
              <SelectItem value="unallocated_first">Unallocated first</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Columns3 className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_COLUMNS.map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.key}
                  checked={isVisible(column.key)}
                  onCheckedChange={() => toggleColumn(column.key)}
                >
                  {column.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <Button variant="outline" onClick={() => void loadRows()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="mb-6 rounded-lg border border-orange-200 bg-orange-50/40 p-4">
          <h3 className="text-lg font-semibold text-slate-900">Allocated delegates by committee</h3>
          <p className="mt-1 text-sm text-slate-600">
            Click a committee to view everyone assigned to it, including their allocation details.
          </p>

          {allocatedDelegatesByCommittee.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No committee allocations yet.</p>
          ) : (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                {allocatedDelegatesByCommittee.map((entry) => (
                  <Button
                    key={entry.committee}
                    variant={selectedAllocationCommittee === entry.committee ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setSelectedAllocationCommittee((current) => (current === entry.committee ? null : entry.committee))
                    }
                  >
                    {entry.committee.toUpperCase()} ({entry.delegates.length})
                  </Button>
                ))}
              </div>

              {selectedAllocationCommittee && (
                <div className="mt-4 rounded-md border bg-white">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>School</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Allocated country / position</TableHead>
                        <TableHead>Allocated by</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allocatedDelegatesByCommittee
                        .find((entry) => entry.committee === selectedAllocationCommittee)
                        ?.delegates.map((delegate) => (
                          <TableRow key={`allocation-overview-${delegate.id}`}>
                            <TableCell>{`${delegate.first_name} ${delegate.last_name}`}</TableCell>
                            <TableCell>{delegate.email}</TableCell>
                            <TableCell>{delegate.school ?? "—"}</TableCell>
                            <TableCell>{delegate.grade ?? "—"}</TableCell>
                            <TableCell>{delegate.allocated_country ?? delegate.allocated_country_code ?? "—"}</TableCell>
                            <TableCell>{formatAllocatorDisplay(delegate.allocated_by_email) ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>

        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {isVisible("name") && <TableHead>Name</TableHead>}
                {isVisible("email") && <TableHead>Email</TableHead>}
                {isVisible("school") && <TableHead>School</TableHead>}
                {isVisible("grade") && <TableHead>Grade</TableHead>}
                {isVisible("preference1") && <TableHead>Preference 1</TableHead>}
                {isVisible("preference2") && <TableHead>Preference 2</TableHead>}
                {isVisible("preference3") && <TableHead>Preference 3</TableHead>}
                {isVisible("experience") && <TableHead>Experience</TableHead>}
                {isVisible("committeeCode") && <TableHead>Committee code</TableHead>}
                {isVisible("countryCode") && <TableHead>Country code</TableHead>}
                {isVisible("allocatedBy") && <TableHead>Allocated by</TableHead>}
                {isVisible("updated") && <TableHead>Updated</TableHead>}
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} className="h-20 text-center text-slate-500">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </TableCell>
                </TableRow>
              ) : sortedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length + 1} className="h-20 text-center text-slate-500">
                    No matching registrations found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedRows.map((row) => {
                  const draft = drafts[row.id]
                  const isSaving = savingIds.has(row.id)
                  const selectedCommitteeCode = normalizeCommitteeCode(draft?.allocated_committee_code)
                  const baseOptions = getAllocationOptionsForCommittee(selectedCommitteeCode)
                  const takenOptions = takenOptionsByCommittee.get(selectedCommitteeCode) ?? new Set<string>()
                  const currentSelection = draft?.allocated_country_code ?? ""

                  const countryOptions = baseOptions.map((option) => {
                    const takenByAnotherDelegate = option !== currentSelection && takenOptions.has(option)
                    return {
                      value: option,
                      label: takenByAnotherDelegate ? `${option} ✓ already allocated` : option,
                      disabled: takenByAnotherDelegate,
                    }
                  })

                  return (
                    <TableRow key={row.id}>
                      {isVisible("name") && <TableCell>{`${row.first_name} ${row.last_name}`}</TableCell>}
                      {isVisible("email") && <TableCell>{row.email}</TableCell>}
                      {isVisible("school") && <TableCell>{row.school ?? "—"}</TableCell>}
                      {isVisible("grade") && <TableCell>{row.grade ?? "—"}</TableCell>}
                      {isVisible("preference1") && <TableCell>{row.delegate_data?.committee1 ?? "—"}</TableCell>}
                      {isVisible("preference2") && <TableCell>{row.delegate_data?.committee2 ?? "—"}</TableCell>}
                      {isVisible("preference3") && <TableCell>{row.delegate_data?.committee3 ?? "—"}</TableCell>}
                      {isVisible("experience") && <TableCell>{row.delegate_data?.experience ?? "—"}</TableCell>}
                      {isVisible("committeeCode") && (
                        <TableCell>
                          <SearchableSelect
                            value={draft?.allocated_committee_code ?? ""}
                            onValueChange={(value) => updateDraft(row.id, "allocated_committee_code", value)}
                            placeholder="Select committee"
                            options={committeeOptions.map((committee) => ({ value: committee, label: committee.toUpperCase() }))}
                            searchPlaceholder="Search committees..."
                            disabled={isSaving}
                          />
                        </TableCell>
                      )}
                      {isVisible("countryCode") && (
                        <TableCell>
                          <SearchableSelect
                            value={draft?.allocated_country_code ?? ""}
                            onValueChange={(value) => updateDraft(row.id, "allocated_country_code", value)}
                            placeholder={selectedCommitteeCode ? "Select country / position" : "Select committee first"}
                            options={countryOptions}
                            searchPlaceholder="Search countries / positions..."
                            disabled={isSaving || !selectedCommitteeCode}
                          />
                        </TableCell>
                      )}
                      {isVisible("allocatedBy") && <TableCell>{formatAllocatorDisplay(row.allocated_by_email) ?? "—"}</TableCell>}
                      {isVisible("updated") && <TableCell>{new Date(row.updated_at).toLocaleString()}</TableCell>}
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => void unassign(row)} disabled={isSaving}>
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Unassign"}
                        </Button>
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
