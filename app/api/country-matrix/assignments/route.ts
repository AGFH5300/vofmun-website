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
    const committeeNameMap: Record<string, string> = {
      ga1: "GA1 - DISEC",
      unhrc: "UNHRC",
      unodc: "UNODC",
      ecosoc: "ECOSOC",
      unsc: "UNSC",
      icrcc: "ICRCC",
    }

    const supabase = await createClient()

    let query = supabase
      .from("users")
      .select("first_name,last_name,allocated_country_code,allocated_country,allocated_committee_code")
      .eq("allocation_status", "allocated")
      .or("allocated_country.not.is.null,allocated_country_code.not.is.null")

    if (committeeCode) {
      query = query.eq("allocated_committee_code", committeeCode)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const assignments = (data ?? [])
      .map((row) => {
        const optionCode = (row.allocated_country ?? row.allocated_country_code)?.trim()
        const assignedName = buildDelegateName(row.first_name, row.last_name)

        if (!optionCode || !assignedName) {
          return null
        }

        const normalizedCommitteeCode = normalizeCommitteeCode(row.allocated_committee_code)

        return {
          optionCode,
          assignedName,
          committeeCode: normalizedCommitteeCode,
          committeeName: committeeNameMap[normalizedCommitteeCode] ?? normalizedCommitteeCode.toUpperCase(),
        }
      })
      .filter(
        (
          entry,
        ): entry is { optionCode: string; assignedName: string; committeeCode: string; committeeName: string } =>
          entry !== null,
      )

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Failed to load matrix assignments", error)
    return NextResponse.json({ error: "Unable to load matrix assignments." }, { status: 500 })
  }
}
