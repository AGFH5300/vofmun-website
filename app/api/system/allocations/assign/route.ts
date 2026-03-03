// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/utils/supabase/server"
import { canAccessAllocations, normalizeEmail } from "@/app/system/_lib/allowlist"
import { createSupabaseAdminClient } from "@/app/system/_lib/supabase-admin"
import { allocationStatuses } from "@/app/system/_lib/allocation-types"

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
  const allocatedAt = payload.allocation_status === "allocated" ? new Date().toISOString() : null

  const { error } = await adminClient
    .from("users")
    .update({
      allocated_committee_code: payload.allocated_committee_code,
      allocated_country_code: payload.allocated_country_code,
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
