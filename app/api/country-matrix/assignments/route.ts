// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextRequest, NextResponse } from "next/server"

import { normalizeCommitteeCode } from "@/app/system/_lib/committee-allocation-options"
import { createClient } from "@/utils/supabase/server"

const buildDelegateName = (firstName: string | null, lastName: string | null) => {
  const trimmedFirstName = firstName?.trim() ?? ""
  const trimmedLastName = lastName?.trim() ?? ""

  return [trimmedFirstName, trimmedLastName].filter(Boolean).join(" ").trim() || null
}

export async function GET(request: NextRequest) {
  try {
    const committeeCode = normalizeCommitteeCode(request.nextUrl.searchParams.get("committee"))

    if (!committeeCode) {
      return NextResponse.json({ error: "Missing committee query parameter." }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from("users")
      .select("first_name,last_name,allocated_country_code")
      .eq("allocation_status", "allocated")
      .eq("allocated_committee_code", committeeCode)
      .not("allocated_country_code", "is", null)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const assignments = (data ?? [])
      .map((row) => {
        const optionCode = row.allocated_country_code?.trim()
        const assignedName = buildDelegateName(row.first_name, row.last_name)

        if (!optionCode || !assignedName) {
          return null
        }

        return { optionCode, assignedName }
      })
      .filter((entry): entry is { optionCode: string; assignedName: string } => entry !== null)

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Failed to load matrix assignments", error)
    return NextResponse.json({ error: "Unable to load matrix assignments." }, { status: 500 })
  }
}
