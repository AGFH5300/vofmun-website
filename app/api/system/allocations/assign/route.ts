// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/utils/supabase/server"
import { canAccessAllocations, normalizeEmail } from "@/app/system/_lib/allowlist"
import { createSupabaseAdminClient } from "@/app/system/_lib/supabase-admin"
import { allocationStatuses } from "@/app/system/_lib/allocation-types"
import { getAllocationOptionsForCommittee, normalizeCommitteeCode } from "@/app/system/_lib/committee-allocation-options"

const assignSchema = z.object({
  userId: z.number().int().positive(),
  allocated_committee_code: z.string().trim().nullable(),
  allocated_country_code: z.string().trim().nullable(),
  allocated_country: z.string().trim().nullable(),
  allocation_status: z.enum(allocationStatuses),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

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

  const adminClient = createSupabaseAdminClient()
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
      .select("id")
      .eq("allocated_committee_code", normalizedCommitteeCode)
      .eq("allocated_country_code", selectedCountryOrRole)
      .neq("id", payload.userId)
      .limit(1)

    if (existingAllocationError) {
      return NextResponse.json({ error: existingAllocationError.message }, { status: 500 })
    }

    if (existingAllocations && existingAllocations.length > 0) {
      return NextResponse.json(
        { error: "This country/position has already been allocated in the selected committee." },
        { status: 409 },
      )
    }
  }

  const allocatedAt = payload.allocation_status === "allocated" ? new Date().toISOString() : null

  const { error } = await adminClient
    .from("users")
    .update({
      allocated_committee_code: normalizedCommitteeCode || null,
      allocated_country_code: selectedCountryOrRole,
      allocated_country: payload.allocated_country,
      allocation_status: payload.allocation_status,
      allocated_by_email: allocatorEmail,
      allocated_at: allocatedAt,
    })
    .eq("id", payload.userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
