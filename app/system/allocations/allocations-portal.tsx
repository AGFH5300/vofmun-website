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
import { getAllocationOptionsForCommittee, normalizeCommitteeCode } from "../_lib/committee-allocation-options"

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
  { key: "updated", label: "Updated" },
]

const DEFAULT_COLUMNS: ColumnKey[] = ALL_COLUMNS.map((column) => column.key)
const COLUMN_COOKIE_NAME = "system_allocations_visible_columns"
const COLUMN_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

const sanitizeColumns = (columns: unknown): ColumnKey[] => {
  if (!Array.isArray(columns)) return DEFAULT_COLUMNS

  const allowed = new Set<ColumnKey>(ALL_COLUMNS.map((column) => column.key))
  const cleaned = columns.filter((column): column is ColumnKey => typeof column === "string" && allowed.has(column as ColumnKey))
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
  const [nameSort, setNameSort] = useState<"name_asc" | "name_desc">("name_asc")
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
        "id,first_name,last_name,email,role,payment_status,school,grade,delegate_data,allocated_committee_code,allocated_country_code,allocation_status,updated_at",
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
            allocated_country_code: row.allocated_country_code ?? "",
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
    const values = new Set<string>()
    eligibleRows.forEach((row) => {
      ;[row.delegate_data?.committee1, row.delegate_data?.committee2, row.delegate_data?.committee3, row.allocated_committee_code]
        .filter(Boolean)
        .forEach((committee) => values.add(String(committee).trim()))
    })
    return Array.from(values).filter(Boolean).sort((a, b) => a.localeCompare(b))
  }, [eligibleRows])

  const takenOptionsByCommittee = useMemo(() => {
    const map = new Map<string, Set<string>>()

    eligibleRows.forEach((row) => {
      const draft = drafts[row.id]
      const committeeCode = normalizeCommitteeCode(draft?.allocated_committee_code ?? row.allocated_committee_code)
      const allocatedOption = (draft?.allocated_country_code ?? row.allocated_country_code)?.trim()

      if (!committeeCode || !allocatedOption) return

      if (!map.has(committeeCode)) {
        map.set(committeeCode, new Set<string>())
      }

      map.get(committeeCode)?.add(allocatedOption)
    })

    return map
  }, [drafts, eligibleRows])

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
      const firstNameCompare = a.first_name.localeCompare(b.first_name)
      const lastNameCompare = a.last_name.localeCompare(b.last_name)
      const result = firstNameCompare !== 0 ? firstNameCompare : lastNameCompare
      return nameSort === "name_asc" ? result : -result
    })
  }, [filteredRows, nameSort])

  const saveAssignment = useCallback(async (rowId: number) => {
    const row = rows.find((item) => item.id === rowId)
    const draft = drafts[rowId]
    if (!row || !draft) return

    const nextStatus = draft.allocated_committee_code && draft.allocated_country_code ? "allocated" : "pending"

    setSavingIds((prev) => new Set(prev).add(rowId))

    try {
      const response = await fetch("/api/system/allocations/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: rowId,
          allocated_committee_code: draft.allocated_committee_code || null,
          allocated_country_code: draft.allocated_country_code || null,
          allocated_country: null,
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
                allocated_country_code: draft.allocated_country_code || null,
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
  }, [drafts, rows])

  const queueAutosave = useCallback(
    (id: number) => {
      const previousTimer = saveTimers.current[id]
      if (previousTimer) clearTimeout(previousTimer)

      saveTimers.current[id] = setTimeout(() => {
        void saveAssignment(id)
      }, 500)
    },
    [saveAssignment],
  )

  const updateDraft = (id: number, field: keyof EditableFields, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? {
          allocated_committee_code: "",
          allocated_country_code: "",
        }),
        [field]: value,
        ...(field === "allocated_committee_code" ? { allocated_country_code: "" } : {}),
      },
    }))
    queueAutosave(id)
  }

  const unassign = async (row: AllocationUserRow) => {
    setSavingIds((prev) => new Set(prev).add(row.id))

    try {
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

        <div className="grid gap-3 md:grid-cols-4">
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
