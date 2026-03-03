// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/utils/supabase/server"
import { canAccessAllocations, normalizeEmail } from "@/app/system/_lib/allowlist"
import { createSupabaseAdminClient } from "@/app/system/_lib/supabase-admin"

const unassignSchema = z.object({
  userId: z.number().int().positive(),
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
  const parsed = unassignSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", details: parsed.error.flatten() }, { status: 400 })
  }

  const adminClient = createSupabaseAdminClient()

  const { error } = await adminClient
    .from("users")
    .update({
      allocated_committee_code: null,
      allocated_country_code: null,
      allocated_country: null,
      allocation_status: "unallocated",
      allocated_by_email: allocatorEmail,
      allocated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
