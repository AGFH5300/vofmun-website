"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { Columns3, Download, Loader2, LogOut, RefreshCw } from "lucide-react"
import * as XLSX from "xlsx"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/utils/supabase/client"

export type SignupRecord = {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: string
  nationality: string | null
  school: string | null
  grade: string | null
  payment_status: PaymentStatusValue | null
  payment_proof_url: string | null
  payment_proof_storage_path: string | null
  payment_proof_file_name: string | null
  payment_proof_payer_name: string | null
  payment_proof_role: string | null
  payment_proof_uploaded_at: string | null
  dietary_type: string | null
  dietary_other: string | null
  has_allergies: string | null
  allergies_details: string | null
  emergency_contact_name: string
  emergency_contact_phone: string
  agree_terms: boolean
  agree_photos: boolean | null
  registration_status: string | null
  referral_codes: string[] | null
  delegate_data:
    | {
        experience?: string | null
        committee1?: string | null
        committee2?: string | null
        committee3?: string | null
      }
    | null
  chair_data:
    | {
        committee1?: string | null
        committee2?: string | null
        committee3?: string | null
        crisisBackroomInterest?: string | null
        whyBestFit?: string | null
        successfulCommittee?: string | null
        strengthWeakness?: string | null
        crisisResponse?: string | null
        availability?: string | null
        experiences?: {
          conference?: string | null
          position?: string | null
          year?: string | null
          description?: string | null
        }[]
        cvUrl?: string | null
        cvFileName?: string | null
        cvStoragePath?: string | null
        cvUploadedAt?: string | null
      }
    | null
  admin_data:
    | {
        experiences?: {
          role?: string | null
          organization?: string | null
          year?: string | null
          description?: string | null
        }[]
        skills?: string[] | null
        whyAdmin?: string | null
        relevantExperience?: string | null
        previousAdmin?: string | null
        understandsRole?: string | null
      }
    | null
  chair_cv_url: string | null
  chair_cv_storage_path: string | null
  chair_cv_file_name: string | null
  chair_cv_uploaded_at: string | null
  created_at: string
  updated_at: string
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
  spreadsheet_storage_path: string
  spreadsheet_mime_type: string
  spreadsheet_url: string | null
  created_at: string
  updated_at: string
}

type PortalContentProps = {
  onSignOut: () => Promise<void>
}

type RegistrationView = "all" | "delegates" | "chairs" | "admins" | "school"

type UserView = Exclude<RegistrationView, "school">

type FieldOption<RecordType> = {
  key: string
  label: string
  description?: string
  render: (record: RecordType) => ReactNode
}

const USER_VIEW_DEFAULT_FIELDS: Record<UserView, string[]> = {
  all: ["name", "email", "phone", "school", "role", "primaryCommittee", "paymentStatus", "paymentProof", "submittedAt", "reviewStatus"],
  delegates: [
    "name",
    "email",
    "phone",
    "school",
    "grade",
    "delegateExperience",
    "delegateCommittee1",
    "delegateCommittee2",
    "delegateCommittee3",
    "dietaryType",
    "emergencyContactName",
    "paymentStatus",
    "reviewStatus",
  ],
  chairs: [
    "name",
    "email",
    "phone",
    "school",
    "chairCommittee1",
    "chairCommittee2",
    "chairExperiences",
    "chairWhyBestFit",
    "paymentStatus",
    "reviewStatus",
  ],
  admins: [
    "name",
    "email",
    "phone",
    "school",
    "adminRelevantExperience",
    "adminPreviousAdmin",
    "adminUnderstandsRole",
    "paymentStatus",
    "reviewStatus",
  ],
}

const USER_VIEWS: UserView[] = ["all", "delegates", "chairs", "admins"]

const SCHOOL_DEFAULT_FIELDS = [
  "schoolName",
  "schoolEmail",
  "schoolCountry",
  "directorName",
  "directorEmail",
  "directorPhone",
  "numDelegates",
  "numFaculty",
  "additionalRequests",
  "heardAbout",
  "spreadsheetUrl",
  "submittedAt",
]

const USER_FIELD_STORAGE_KEY = "vofmun_system_user_fields_v1"
const SCHOOL_FIELD_STORAGE_KEY = "vofmun_system_school_fields_v1"

const COLUMN_MENU_LABELS: Record<RegistrationView, string> = {
  all: "All signup columns",
  delegates: "Delegate columns",
  chairs: "Chair columns",
  admins: "Admin columns",
  school: "School delegation columns",
}

const buildDefaultUserFieldSelection = (): Record<UserView, string[]> => ({
  all: [...USER_VIEW_DEFAULT_FIELDS.all],
  delegates: [...USER_VIEW_DEFAULT_FIELDS.delegates],
  chairs: [...USER_VIEW_DEFAULT_FIELDS.chairs],
  admins: [...USER_VIEW_DEFAULT_FIELDS.admins],
})

const buildDefaultSchoolFieldSelection = () => [...SCHOOL_DEFAULT_FIELDS]

type ExperienceEntry = {
  title?: string | null
  subtitle?: string | null
  meta?: string | null
  description?: string | null
}

const dateTimeDisplayOptions: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
}

function formatDateTime(value: string | null) {
  if (!value) return "—"
  return new Date(value).toLocaleDateString(undefined, dateTimeDisplayOptions)
}

function formatBooleanFlag(value: boolean | null | undefined) {
  if (value === null || value === undefined) return "—"
  return value ? "Yes" : "No"
}

function formatNullableText(value?: string | null) {
  if (!value) return "—"
  const trimmed = value.trim()
  return trimmed.length ? trimmed : "—"
}

function renderMultilineText(value?: string | null): ReactNode {
  if (!value) {
    return <span className="text-slate-400">—</span>
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return <span className="text-slate-400">—</span>
  }

  const normalized = trimmed.replace(/\r\n/g, "\n")
  const paragraphs = normalized.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean)

  if (!paragraphs.length) {
    return <span className="text-slate-400">—</span>
  }

  return (
    <div className="space-y-2 text-sm leading-relaxed text-slate-600">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 12)}`} className="whitespace-pre-line break-words">
          {paragraph}
        </p>
      ))}
    </div>
  )
}

function formatList(values?: string[] | null) {
  if (!values || values.length === 0) {
    return "—"
  }

  return values.join(", ")
}

function renderExperienceEntries(entries?: ExperienceEntry[] | null): ReactNode {
  if (!entries || entries.length === 0) {
    return <span className="text-slate-400">Not provided</span>
  }

  return <ExperienceEntriesList entries={entries} />
}

function sanitizeFieldList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) {
    return [...fallback]
  }

  const filtered = value.filter((entry): entry is string => typeof entry === "string")
  return filtered.length ? filtered : [...fallback]
}

function sanitizeUserFieldSelections(value: unknown): Record<UserView, string[]> {
  if (typeof value !== "object" || value === null) {
    return buildDefaultUserFieldSelection()
  }

  return USER_VIEWS.reduce((acc, view) => {
    const stored = (value as Record<string, unknown>)[view]
    acc[view] = sanitizeFieldList(stored, USER_VIEW_DEFAULT_FIELDS[view])
    return acc
  }, {} as Record<UserView, string[]>)
}

function sanitizeSchoolFieldSelection(value: unknown) {
  return sanitizeFieldList(value, SCHOOL_DEFAULT_FIELDS)
}

const SCHOOL_FIELD_OPTIONS: FieldOption<SchoolDelegationRecord>[] = [
  {
    key: "schoolName",
    label: "School name",
    description: "Name submitted by the school delegation",
    render: (record) => <span className="font-medium text-slate-900">{record.school_name}</span>,
  },
  {
    key: "schoolEmail",
    label: "School email",
    render: (record) => (
      <Link
        href={`mailto:${record.school_email}`}
        className="text-[#B22222] underline-offset-2 hover:text-[#8B1A1A] hover:underline"
      >
        {record.school_email}
      </Link>
    ),
  },
  {
    key: "schoolAddress",
    label: "School address",
    render: (record) => <span className="text-slate-600">{record.school_address}</span>,
  },
  {
    key: "schoolCountry",
    label: "Country",
    render: (record) => <span className="text-slate-600">{record.school_country}</span>,
  },
  {
    key: "directorName",
    label: "Director name",
    render: (record) => <span className="font-medium text-slate-900">{record.director_name}</span>,
  },
  {
    key: "directorEmail",
    label: "Director email",
    render: (record) => (
      <Link
        href={`mailto:${record.director_email}`}
        className="text-[#B22222] underline-offset-2 hover:text-[#8B1A1A] hover:underline"
      >
        {record.director_email}
      </Link>
    ),
  },
  {
    key: "directorPhone",
    label: "Director phone",
    render: (record) => <span className="text-slate-600">{record.director_phone}</span>,
  },
  {
    key: "numDelegates",
    label: "# Delegates",
    render: (record) => <span className="text-slate-700">{record.num_delegates}</span>,
  },
  {
    key: "numFaculty",
    label: "# Faculty",
    render: (record) => <span className="text-slate-700">{record.num_faculty}</span>,
  },
  {
    key: "additionalRequests",
    label: "Additional requests",
    render: (record) => <span className="text-slate-600">{formatNullableText(record.additional_requests)}</span>,
  },
  {
    key: "heardAbout",
    label: "Heard about",
    render: (record) => <span className="text-slate-600">{formatNullableText(record.heard_about)}</span>,
  },
  {
    key: "termsAccepted",
    label: "Terms accepted",
    render: (record) => <span className="text-slate-600">{formatBooleanFlag(record.terms_accepted)}</span>,
  },
  {
    key: "spreadsheetFileName",
    label: "Spreadsheet file",
    render: (record) => <span className="text-slate-600">{record.spreadsheet_file_name}</span>,
  },
  {
    key: "spreadsheetUrl",
    label: "Spreadsheet URL",
    render: (record) =>
      record.spreadsheet_url ? (
        <Link
          href={record.spreadsheet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 underline-offset-2 hover:text-emerald-500 hover:underline"
        >
          Download
        </Link>
      ) : (
        <span className="text-slate-400">Not available</span>
      ),
  },
  {
    key: "spreadsheetStoragePath",
    label: "Spreadsheet path",
    render: (record) => <span className="font-mono text-xs text-slate-500">{record.spreadsheet_storage_path}</span>,
  },
  {
    key: "spreadsheetMimeType",
    label: "Spreadsheet MIME",
    render: (record) => <span className="text-slate-600">{record.spreadsheet_mime_type}</span>,
  },
  {
    key: "submittedAt",
    label: "Submitted at",
    render: (record) => <span className="text-slate-500">{formatDateTime(record.created_at)}</span>,
  },
  {
    key: "updatedAt",
    label: "Updated at",
    render: (record) => <span className="text-slate-500">{formatDateTime(record.updated_at)}</span>,
  },
]

function createUserFieldOptions(
  handleStatusChange: (recordId: number, nextStatus: PaymentStatusValue) => Promise<void> | void,
  updatingId: number | null,
): Record<UserView, FieldOption<SignupRecord>[]> {
  const baseFields: FieldOption<SignupRecord>[] = [
    {
      key: "id",
      label: "Record ID",
      description: "Primary key stored in Supabase",
      render: (record) => <span className="font-mono text-xs text-slate-500">{record.id}</span>,
    },
    {
      key: "name",
      label: "Name",
      render: (record) => (
        <div className="font-medium text-slate-900">
          {record.first_name} {record.last_name}
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (record) => (
        <Link
          href={`mailto:${record.email}`}
          className="text-[#B22222] underline-offset-2 hover:text-[#8B1A1A] hover:underline"
        >
          {record.email}
        </Link>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      render: (record) => <span className="text-slate-600">{record.phone}</span>,
    },
    {
      key: "school",
      label: "School",
      render: (record) => <span className="text-slate-600">{record.school ?? "—"}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: (record) => <span className="capitalize text-slate-700">{record.role}</span>,
    },
    {
      key: "grade",
      label: "Grade",
      render: (record) => <span className="text-slate-600">{record.grade ?? "—"}</span>,
    },
    {
      key: "nationality",
      label: "Nationality",
      render: (record) => <span className="text-slate-600">{record.nationality ?? "—"}</span>,
    },
    {
      key: "primaryCommittee",
      label: "Committee pref #1",
      render: (record) => <span className="text-slate-700">{getPrimaryCommitteePreference(record) ?? "—"}</span>,
    },
    {
      key: "paymentStatus",
      label: "Payment status",
      render: (record) => (
        <Badge
          variant={badgeVariantForStatus(record.payment_status)}
          className={badgeClassNameForStatus(record.payment_status)}
        >
          {formatPaymentStatus(record.payment_status)}
        </Badge>
      ),
    },
    {
      key: "paymentProof",
      label: "Payment proof",
      render: (record) =>
        record.payment_proof_url ? (
          <Link
            href={record.payment_proof_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 underline-offset-2 hover:text-emerald-500 hover:underline"
          >
            {record.payment_proof_file_name ?? "View proof"}
          </Link>
        ) : (
          <span className="text-slate-400">Not provided</span>
        ),
    },
    {
      key: "paymentProofFileName",
      label: "Proof file",
      render: (record) => <span className="text-slate-600">{record.payment_proof_file_name ?? "—"}</span>,
    },
    {
      key: "paymentProofPayer",
      label: "Payer name",
      render: (record) => <span className="text-slate-600">{record.payment_proof_payer_name ?? "—"}</span>,
    },
    {
      key: "paymentProofRole",
      label: "Payment role",
      render: (record) => <span className="text-slate-600">{record.payment_proof_role ?? "—"}</span>,
    },
    {
      key: "paymentProofUploadedAt",
      label: "Proof uploaded",
      render: (record) => <span className="text-slate-500">{formatDateTime(record.payment_proof_uploaded_at)}</span>,
    },
    {
      key: "paymentProofStoragePath",
      label: "Proof storage path",
      render: (record) => (
        <span className="font-mono text-xs text-slate-500">{record.payment_proof_storage_path ?? "—"}</span>
      ),
    },
    {
      key: "registrationStatus",
      label: "Registration status",
      render: (record) => <span className="text-slate-600">{record.registration_status ?? "—"}</span>,
    },
    {
      key: "submittedAt",
      label: "Submitted at",
      render: (record) => <span className="text-slate-500">{formatDateTime(record.created_at)}</span>,
    },
    {
      key: "updatedAt",
      label: "Updated at",
      render: (record) => <span className="text-slate-500">{formatDateTime(record.updated_at)}</span>,
    },
    {
      key: "dietaryType",
      label: "Dietary preference",
      render: (record) => <span className="text-slate-600">{record.dietary_type ?? "—"}</span>,
    },
    {
      key: "dietaryOther",
      label: "Dietary notes",
      render: (record) => <span className="text-slate-600">{formatNullableText(record.dietary_other)}</span>,
    },
    {
      key: "hasAllergies",
      label: "Allergies",
      render: (record) => <span className="text-slate-600">{record.has_allergies ?? "—"}</span>,
    },
    {
      key: "allergiesDetails",
      label: "Allergy details",
      render: (record) => <span className="text-slate-600">{formatNullableText(record.allergies_details)}</span>,
    },
    {
      key: "emergencyContactName",
      label: "Emergency contact",
      render: (record) => <span className="text-slate-600">{record.emergency_contact_name}</span>,
    },
    {
      key: "emergencyContactPhone",
      label: "Emergency phone",
      render: (record) => <span className="text-slate-600">{record.emergency_contact_phone}</span>,
    },
    {
      key: "agreeTerms",
      label: "Agreed to terms",
      render: (record) => <span className="text-slate-600">{formatBooleanFlag(record.agree_terms)}</span>,
    },
    {
      key: "agreePhotos",
      label: "Photo consent",
      render: (record) => <span className="text-slate-600">{formatBooleanFlag(record.agree_photos)}</span>,
    },
    {
      key: "referralCodes",
      label: "Referral codes",
      render: (record) => <span className="text-slate-600">{formatList(record.referral_codes)}</span>,
    },
    {
      key: "reviewStatus",
      label: "Review status",
      description: "Update payment review status",
      render: (record) => (
        <Select
          value={(record.payment_status ?? "unpaid") as PaymentStatusValue}
          onValueChange={(value) => void handleStatusChange(record.id, value as PaymentStatusValue)}
          disabled={updatingId === record.id}
        >
          <SelectTrigger className="w-[180px] border-[#B22222]/40 text-left text-sm focus:ring-[#B22222]">
            {updatingId === record.id ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Updating...
              </span>
            ) : (
              <SelectValue />
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
      ),
    },
  ]

  const delegateFields: FieldOption<SignupRecord>[] = [
    {
      key: "delegateExperience",
      label: "Delegate experience",
      render: (record) => renderMultilineText(record.delegate_data?.experience),
    },
    {
      key: "delegateCommittee1",
      label: "Delegate pref #1",
      render: (record) => <span className="text-slate-600">{record.delegate_data?.committee1 ?? "—"}</span>,
    },
    {
      key: "delegateCommittee2",
      label: "Delegate pref #2",
      render: (record) => <span className="text-slate-600">{record.delegate_data?.committee2 ?? "—"}</span>,
    },
    {
      key: "delegateCommittee3",
      label: "Delegate pref #3",
      render: (record) => <span className="text-slate-600">{record.delegate_data?.committee3 ?? "—"}</span>,
    },
  ]

  const chairFields: FieldOption<SignupRecord>[] = [
    {
      key: "chairCommittee1",
      label: "Chair pref #1",
      render: (record) => <span className="text-slate-600">{record.chair_data?.committee1 ?? "—"}</span>,
    },
    {
      key: "chairCommittee2",
      label: "Chair pref #2",
      render: (record) => <span className="text-slate-600">{record.chair_data?.committee2 ?? "—"}</span>,
    },
    {
      key: "chairCommittee3",
      label: "Chair pref #3",
      render: (record) => <span className="text-slate-600">{record.chair_data?.committee3 ?? "—"}</span>,
    },
    {
      key: "chairExperiences",
      label: "Chair experiences",
      render: (record) =>
        renderExperienceEntries(
          record.chair_data?.experiences?.map((experience) => ({
            title: experience.conference,
            subtitle: experience.position,
            meta: experience.year,
            description: experience.description,
          })),
        ),
    },
    {
      key: "chairCrisisInterest",
      label: "Crisis/backroom interest",
      render: (record) => renderMultilineText(record.chair_data?.crisisBackroomInterest),
    },
    {
      key: "chairWhyBestFit",
      label: "Why best fit",
      render: (record) => renderMultilineText(record.chair_data?.whyBestFit),
    },
    {
      key: "chairSuccessfulCommittee",
      label: "Successful committee",
      render: (record) => renderMultilineText(record.chair_data?.successfulCommittee),
    },
    {
      key: "chairStrengthWeakness",
      label: "Strengths & weaknesses",
      render: (record) => renderMultilineText(record.chair_data?.strengthWeakness),
    },
    {
      key: "chairCrisisResponse",
      label: "Crisis response",
      render: (record) => renderMultilineText(record.chair_data?.crisisResponse),
    },
    {
      key: "chairAvailability",
      label: "Availability",
      render: (record) => renderMultilineText(record.chair_data?.availability),
    },
    {
      key: "chairCvFileName",
      label: "Chair CV file",
      render: (record) => <span className="text-slate-600">{record.chair_cv_file_name ?? "—"}</span>,
    },
    {
      key: "chairCvUrl",
      label: "Chair CV URL",
      render: (record) =>
        record.chair_cv_url ? (
          <Link
            href={record.chair_cv_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 underline-offset-2 hover:text-emerald-500 hover:underline"
          >
            View CV
          </Link>
        ) : (
          <span className="text-slate-400">Not uploaded</span>
        ),
    },
    {
      key: "chairCvUploadedAt",
      label: "Chair CV uploaded",
      render: (record) => <span className="text-slate-500">{formatDateTime(record.chair_cv_uploaded_at)}</span>,
    },
    {
      key: "chairCvStoragePath",
      label: "Chair CV path",
      render: (record) => <span className="font-mono text-xs text-slate-500">{record.chair_cv_storage_path ?? "—"}</span>,
    },
  ]

  const adminFields: FieldOption<SignupRecord>[] = [
    {
      key: "adminRelevantExperience",
      label: "Relevant experience",
      render: (record) => renderMultilineText(record.admin_data?.relevantExperience),
    },
    {
      key: "adminWhy",
      label: "Why admin",
      render: (record) => renderMultilineText(record.admin_data?.whyAdmin),
    },
    {
      key: "adminSkills",
      label: "Skills",
      render: (record) => <span className="text-slate-600">{formatList(record.admin_data?.skills)}</span>,
    },
    {
      key: "adminExperiences",
      label: "Admin experiences",
      render: (record) =>
        renderExperienceEntries(
          record.admin_data?.experiences?.map((experience) => ({
            title: experience.organization ?? experience.role,
            subtitle: experience.role,
            meta: experience.year,
            description: experience.description,
          })),
        ),
    },
    {
      key: "adminPreviousAdmin",
      label: "Previous admin?",
      render: (record) => <span className="text-slate-600">{record.admin_data?.previousAdmin ?? "—"}</span>,
    },
    {
      key: "adminUnderstandsRole",
      label: "Understands role?",
      render: (record) => <span className="text-slate-600">{record.admin_data?.understandsRole ?? "—"}</span>,
    },
  ]

  return {
    all: baseFields,
    delegates: [...baseFields, ...delegateFields],
    chairs: [...baseFields, ...chairFields],
    admins: [...baseFields, ...adminFields],
  }
}

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
  const [selectedUserFields, setSelectedUserFields] = useState<Record<UserView, string[]>>(buildDefaultUserFieldSelection)
  const [selectedSchoolFields, setSelectedSchoolFields] = useState<string[]>(buildDefaultSchoolFieldSelection)
  const [preferencesHydrated, setPreferencesHydrated] = useState(false)
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({})
  const [schoolColumnWidths, setSchoolColumnWidths] = useState<Record<string, number>>({})
  const resizeState = useRef<{
    key: string
    startX: number
    startWidth: number
    target: "user" | "school"
  } | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const storedUserFields = window.localStorage.getItem(USER_FIELD_STORAGE_KEY)
      const storedSchoolFields = window.localStorage.getItem(SCHOOL_FIELD_STORAGE_KEY)

      if (storedUserFields) {
        setSelectedUserFields(sanitizeUserFieldSelections(JSON.parse(storedUserFields)))
      }

      if (storedSchoolFields) {
        setSelectedSchoolFields(sanitizeSchoolFieldSelection(JSON.parse(storedSchoolFields)))
      }
    } catch (cause) {
      console.warn("Failed to restore saved column preferences", cause)
    } finally {
      setPreferencesHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!preferencesHydrated || typeof window === "undefined") return

    try {
      window.localStorage.setItem(USER_FIELD_STORAGE_KEY, JSON.stringify(selectedUserFields))
    } catch (cause) {
      console.warn("Unable to persist user column preferences", cause)
    }
  }, [preferencesHydrated, selectedUserFields])

  useEffect(() => {
    if (!preferencesHydrated || typeof window === "undefined") return

    try {
      window.localStorage.setItem(SCHOOL_FIELD_STORAGE_KEY, JSON.stringify(selectedSchoolFields))
    } catch (cause) {
      console.warn("Unable to persist school column preferences", cause)
    }
  }, [preferencesHydrated, selectedSchoolFields])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!resizeState.current) return

      const { key, startX, startWidth, target } = resizeState.current
      const delta = event.clientX - startX
      const nextWidth = Math.min(900, Math.max(180, startWidth + delta))

      if (target === "user") {
        setColumnWidths((previous) => (previous[key] === nextWidth ? previous : { ...previous, [key]: nextWidth }))
      } else {
        setSchoolColumnWidths((previous) => (previous[key] === nextWidth ? previous : { ...previous, [key]: nextWidth }))
      }
    }

    const handleMouseUp = () => {
      resizeState.current = null
      document.body.style.removeProperty("user-select")
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  const getColumnStyle = useCallback(
    (key: string, target: "user" | "school") => {
      const width = target === "user" ? columnWidths[key] : schoolColumnWidths[key]
      return {
        width: width ?? 260,
        minWidth: 200,
        maxWidth: 900,
      }
    },
    [columnWidths, schoolColumnWidths],
  )

  const handleResizeStart = useCallback(
    (key: string, event: React.MouseEvent<HTMLSpanElement, MouseEvent>, target: "user" | "school") => {
      event.preventDefault()
      const headerCell = event.currentTarget.parentElement as HTMLElement | null
      const currentWidth = headerCell?.getBoundingClientRect().width
      resizeState.current = {
        key,
        startX: event.clientX,
        startWidth: currentWidth ?? getColumnStyle(key, target).width ?? 260,
        target,
      }
      document.body.style.userSelect = "none"
    },
    [getColumnStyle],
  )

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const { data, error: queryError } = await supabase
      .from("users")
      .select(
        [
          "id",
          "first_name",
          "last_name",
          "email",
          "phone",
          "role",
          "nationality",
          "school",
          "grade",
          "payment_status",
          "payment_proof_url",
          "payment_proof_storage_path",
          "payment_proof_file_name",
          "payment_proof_payer_name",
          "payment_proof_role",
          "payment_proof_uploaded_at",
          "dietary_type",
          "dietary_other",
          "has_allergies",
          "allergies_details",
          "emergency_contact_name",
          "emergency_contact_phone",
          "agree_terms",
          "agree_photos",
          "registration_status",
          "referral_codes",
          "delegate_data",
          "chair_data",
          "admin_data",
          "chair_cv_url",
          "chair_cv_storage_path",
          "chair_cv_file_name",
          "chair_cv_uploaded_at",
          "created_at",
          "updated_at",
        ].join(", "),
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
        [
          "id",
          "school_name",
          "school_address",
          "school_email",
          "school_country",
          "director_name",
          "director_email",
          "director_phone",
          "num_faculty",
          "num_delegates",
          "additional_requests",
          "heard_about",
          "terms_accepted",
          "spreadsheet_file_name",
          "spreadsheet_storage_path",
          "spreadsheet_mime_type",
          "spreadsheet_url",
          "created_at",
          "updated_at",
        ].join(", "),
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

  const handleUserFieldToggle = useCallback((view: UserView, fieldKey: string, isChecked: boolean) => {
    setSelectedUserFields((previous) => {
      const current = previous[view] ?? []

      if (!isChecked && current.length === 1) {
        return previous
      }

      const nextViewFields = isChecked
        ? Array.from(new Set([...current, fieldKey]))
        : current.filter((key) => key !== fieldKey)

      return {
        ...previous,
        [view]: nextViewFields,
      }
    })
  }, [])

  const resetUserFields = useCallback((view: UserView) => {
    setSelectedUserFields((previous) => ({
      ...previous,
      [view]: [...USER_VIEW_DEFAULT_FIELDS[view]],
    }))
  }, [])

  const handleSchoolFieldToggle = useCallback((fieldKey: string, isChecked: boolean) => {
    setSelectedSchoolFields((previous) => {
      if (!isChecked && previous.length === 1) {
        return previous
      }

      if (isChecked) {
        if (previous.includes(fieldKey)) {
          return previous
        }

        return [...previous, fieldKey]
      }

      return previous.filter((key) => key !== fieldKey)
    })
  }, [])

  const resetSchoolFields = useCallback(() => {
    setSelectedSchoolFields(buildDefaultSchoolFieldSelection())
  }, [])

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

  const userFieldOptions = useMemo(
    () => createUserFieldOptions(handleStatusChange, updatingId),
    [handleStatusChange, updatingId],
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

  const renderUserTab = (recordsToDisplay: SignupRecord[], emptyMessage: string, view: UserView) => {
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

    const availableFields = userFieldOptions[view] ?? []
    const selectedFields = selectedUserFields[view] ?? []
    const visibleFields = availableFields.filter((field) => selectedFields.includes(field.key))

    if (visibleFields.length === 0) {
      return (
        <div className="px-6 py-10 text-center text-sm text-slate-500">
          Select at least one column to display results.
        </div>
      )
    }

    return (
      <Table className="min-w-full text-slate-900">
        <TableHeader>
          <TableRow className="border-slate-200/90">
            {visibleFields.map((field) => {
              const columnStyle = getColumnStyle(field.key, "user")

              return (
                <TableHead
                  key={field.key}
                  style={columnStyle}
                  className="group relative whitespace-normal text-slate-700"
                  title={field.description ?? undefined}
                >
                  <div className="flex items-start gap-2 pr-3">
                    <span className="truncate text-[11px] font-semibold tracking-wide text-slate-700">
                      {field.label}
                    </span>
                    {field.description ? (
                      <span className="text-[10px] font-normal leading-snug text-slate-400">{field.description}</span>
                    ) : null}
                  </div>
                  <span
                    aria-hidden
                    onMouseDown={(event) => handleResizeStart(field.key, event, "user")}
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize select-none bg-transparent transition-colors group-hover:bg-[#B22222]/15"
                  />
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {recordsToDisplay.map((record) => (
            <TableRow key={record.id} className="border-slate-200/80 odd:bg-white even:bg-slate-50/50">
              {visibleFields.map((field) => {
                const columnStyle = getColumnStyle(field.key, "user")

                return (
                  <TableCell
                    key={`${record.id}-${field.key}`}
                    style={columnStyle}
                    className="align-top text-slate-800"
                  >
                    {field.render(record)}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
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

    const visibleFields = SCHOOL_FIELD_OPTIONS.filter((field) => selectedSchoolFields.includes(field.key))

    if (visibleFields.length === 0) {
      return (
        <div className="px-6 py-10 text-center text-sm text-slate-500">
          Select at least one column to display results.
        </div>
      )
    }

    return (
      <Table className="min-w-full text-slate-900">
        <TableHeader>
          <TableRow className="border-slate-200/90">
            {visibleFields.map((field) => {
              const columnStyle = getColumnStyle(field.key, "school")

              return (
                <TableHead
                  key={field.key}
                  style={columnStyle}
                  className="group relative whitespace-normal text-slate-700"
                  title={field.description ?? undefined}
                >
                  <div className="flex items-start gap-2 pr-3">
                    <span className="truncate text-[11px] font-semibold tracking-wide text-slate-700">
                      {field.label}
                    </span>
                    {field.description ? (
                      <span className="text-[10px] font-normal leading-snug text-slate-400">{field.description}</span>
                    ) : null}
                  </div>
                  <span
                    aria-hidden
                    onMouseDown={(event) => handleResizeStart(field.key, event, "school")}
                    className="absolute right-0 top-0 h-full w-2 cursor-col-resize select-none bg-transparent transition-colors group-hover:bg-[#B22222]/15"
                  />
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {schoolDelegations.map((record) => (
            <TableRow key={record.id} className="border-slate-200/80 odd:bg-white even:bg-slate-50/50">
              {visibleFields.map((field) => {
                const columnStyle = getColumnStyle(field.key, "school")

                return (
                  <TableCell
                    key={`${record.id}-${field.key}`}
                    style={columnStyle}
                    className="align-top text-slate-800"
                  >
                    {field.render(record)}
                  </TableCell>
                )
              })}
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

            <TabsContent value="all" className="px-0 space-y-2">
              <div className="flex justify-end px-6">
                <ColumnSelector
                  label={COLUMN_MENU_LABELS.all}
                  options={userFieldOptions.all}
                  selectedKeys={selectedUserFields.all}
                  onToggle={(fieldKey, checked) => handleUserFieldToggle("all", fieldKey, checked)}
                  onReset={() => resetUserFields("all")}
                />
              </div>
              {updateError && <div className="px-6 pt-0 text-sm text-red-500">{updateError}</div>}
              {renderUserTab(records, "No registrations found yet.", "all")}
            </TabsContent>
            <TabsContent value="delegates" className="px-0 space-y-2">
              <div className="flex justify-end px-6">
                <ColumnSelector
                  label={COLUMN_MENU_LABELS.delegates}
                  options={userFieldOptions.delegates}
                  selectedKeys={selectedUserFields.delegates}
                  onToggle={(fieldKey, checked) => handleUserFieldToggle("delegates", fieldKey, checked)}
                  onReset={() => resetUserFields("delegates")}
                />
              </div>
              {updateError && <div className="px-6 pt-0 text-sm text-red-500">{updateError}</div>}
              {renderUserTab(delegateRegistrations, "No delegate registrations yet.", "delegates")}
            </TabsContent>
            <TabsContent value="chairs" className="px-0 space-y-2">
              <div className="flex justify-end px-6">
                <ColumnSelector
                  label={COLUMN_MENU_LABELS.chairs}
                  options={userFieldOptions.chairs}
                  selectedKeys={selectedUserFields.chairs}
                  onToggle={(fieldKey, checked) => handleUserFieldToggle("chairs", fieldKey, checked)}
                  onReset={() => resetUserFields("chairs")}
                />
              </div>
              {updateError && <div className="px-6 pt-0 text-sm text-red-500">{updateError}</div>}
              {renderUserTab(chairRegistrations, "No chair applications yet.", "chairs")}
            </TabsContent>
            <TabsContent value="admins" className="px-0 space-y-2">
              <div className="flex justify-end px-6">
                <ColumnSelector
                  label={COLUMN_MENU_LABELS.admins}
                  options={userFieldOptions.admins}
                  selectedKeys={selectedUserFields.admins}
                  onToggle={(fieldKey, checked) => handleUserFieldToggle("admins", fieldKey, checked)}
                  onReset={() => resetUserFields("admins")}
                />
              </div>
              {updateError && <div className="px-6 pt-0 text-sm text-red-500">{updateError}</div>}
              {renderUserTab(adminRegistrations, "No admin applications yet.", "admins")}
            </TabsContent>
            <TabsContent value="school" className="px-0 space-y-2">
              <div className="flex justify-end px-6">
                <ColumnSelector
                  label={COLUMN_MENU_LABELS.school}
                  options={SCHOOL_FIELD_OPTIONS}
                  selectedKeys={selectedSchoolFields}
                  onToggle={handleSchoolFieldToggle}
                  onReset={resetSchoolFields}
                />
              </div>
              {renderSchoolTab()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

type ColumnSelectorProps = {
  label: string
  options: Pick<FieldOption<unknown>, "key" | "label" | "description">[]
  selectedKeys: string[]
  onToggle: (fieldKey: string, checked: boolean) => void
  onReset: () => void
}

function ColumnSelector({ label, options, selectedKeys, onToggle, onReset }: ColumnSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-[#B22222]/30 text-xs text-[#B22222] hover:bg-[#B22222]/10"
        >
          <Columns3 className="h-3.5 w-3.5" /> Columns ({selectedKeys.length}/{options.length})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs uppercase tracking-[0.2em] text-slate-500">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.key}
            checked={selectedKeys.includes(option.key)}
            onCheckedChange={(checked) => onToggle(option.key, checked === true)}
            className="py-2 text-sm"
          >
            <div className="flex flex-col">
              <span className="text-slate-900">{option.label}</span>
              {option.description ? (
                <span className="text-xs text-slate-500">{option.description}</span>
              ) : null}
            </div>
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault()
            onReset()
          }}
        >
          Reset to defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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

const EXPERIENCE_PREVIEW_COUNT = 4

type ExperienceEntriesListProps = {
  entries: ExperienceEntry[]
}

function ExperienceEntriesList({ entries }: ExperienceEntriesListProps) {
  const [expanded, setExpanded] = useState(false)

  const visibleEntries = expanded ? entries : entries.slice(0, EXPERIENCE_PREVIEW_COUNT)

  return (
    <div className="space-y-3 text-xs text-slate-600">
      <div className="grid gap-2 md:grid-cols-2">
        {visibleEntries.map((entry, index) => (
          <div key={`${entry.title ?? "entry"}-${index}`} className="rounded border border-slate-200/80 p-2">
            <div className="font-semibold text-slate-900">
              {entry.title ?? "—"}
              {entry.meta ? <span className="text-slate-500"> · {entry.meta}</span> : null}
            </div>
            {entry.subtitle ? <div className="text-slate-600">{entry.subtitle}</div> : null}
            {entry.description ? (
              <div className="text-slate-500">
                <div className="whitespace-pre-line break-words text-[0.8rem]">{entry.description}</div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      {entries.length > EXPERIENCE_PREVIEW_COUNT ? (
        <button
          type="button"
          onClick={() => setExpanded((previous) => !previous)}
          className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#B22222] transition hover:text-[#8B1A1A]"
        >
          {expanded ? "Show fewer experiences" : `Show all ${entries.length} experiences`}
        </button>
      ) : null}
    </div>
  )
}
