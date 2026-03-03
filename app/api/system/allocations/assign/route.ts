// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/utils/supabase/server"
import { canAccessAllocations, isSystemAdmin, normalizeEmail } from "@/app/system/_lib/allowlist"
import { createSupabaseAdminClient } from "@/app/system/_lib/supabase-admin"
import { allocationStatuses } from "@/app/system/_lib/allocation-types"
import { getAllocationOptionsForCommittee, normalizeCommitteeCode } from "@/app/system/_lib/committee-allocation-options"
import { getAllocatorLabelFromEmail } from "@/app/system/_lib/allocator-label"

const assignSchema = z.object({
  userId: z.number().int().positive(),
  allocated_committee_code: z.string().trim().nullable(),
  allocated_country_code: z.string().trim().nullable(),
  allocated_country: z.string().trim().nullable(),
  allocation_status: z.enum(allocationStatuses),
})

const getBearerToken = (request: Request) => {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return null

  const [scheme, token] = authHeader.split(" ")
  if (scheme?.toLowerCase() !== "bearer" || !token) return null

  return token
}

export async function POST(request: Request) {
  const adminClient = createSupabaseAdminClient()
  const bearerToken = getBearerToken(request)
  const userResult = bearerToken
    ? await adminClient.auth.getUser(bearerToken)
    : await (await createClient()).auth.getUser()

  const {
    data: { user },
    error: authError,
  } = userResult

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const allocatorEmail = normalizeEmail(user.email)

  if (!canAccessAllocations(allocatorEmail)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json().catch(() => null)
  const parsed = assignSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const payload = parsed.data
  const normalizedCommitteeCode = normalizeCommitteeCode(payload.allocated_committee_code)
  const selectedCountryOrRole = payload.allocated_country_code?.trim() || null

  if (!normalizedCommitteeCode && selectedCountryOrRole) {
    return NextResponse.json({ error: "Select a committee before assigning a country/position." }, { status: 400 })
  }

  if (normalizedCommitteeCode && selectedCountryOrRole) {
    const committeeOptions = getAllocationOptionsForCommittee(normalizedCommitteeCode)
    if (!committeeOptions.includes(selectedCountryOrRole)) {
      return NextResponse.json(
        { error: "Selected country/position is not available for the chosen committee." },
        { status: 400 },
      )
    }

    const { data: existingAllocations, error: existingAllocationError } = await adminClient
      .from("users")
      .select("id,allocated_committee_code,allocated_country_code")
      .neq("id", payload.userId)
      .not("allocated_committee_code", "is", null)
      .not("allocated_country_code", "is", null)

    if (existingAllocationError) {
      return NextResponse.json({ error: existingAllocationError.message }, { status: 500 })
    }

    const hasConflictingAllocation = (existingAllocations ?? []).some((allocation) => {
      const existingCommitteeCode = normalizeCommitteeCode(allocation.allocated_committee_code)
      const existingCountryOrRole = allocation.allocated_country_code?.trim().toLowerCase()

      return (
        existingCommitteeCode === normalizedCommitteeCode &&
        existingCountryOrRole === selectedCountryOrRole.toLowerCase()
      )
    })

    if (hasConflictingAllocation) {
      return NextResponse.json(
        { error: "This country/position has already been allocated in the selected committee." },
        { status: 409 },
      )
    }
  }

  const allocatedAt = payload.allocation_status === "allocated" ? new Date().toISOString() : null
  const isAdminAllocator = isSystemAdmin(allocatorEmail)
  const allocatorLabel = getAllocatorLabelFromEmail(allocatorEmail, isAdminAllocator)

  const { error } = await adminClient
    .from("users")
    .update({
      allocated_committee_code: normalizedCommitteeCode || null,
      allocated_country_code: selectedCountryOrRole,
      allocated_country: payload.allocated_country,
      allocation_status: payload.allocation_status,
      allocated_by_email: allocatorLabel,
      allocated_at: allocatedAt,
    })
    .eq("id", payload.userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
