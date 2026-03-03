// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import ecosocMatrix from "@/lib/country-matrix/ecosoc.json"
import ga1Matrix from "@/lib/country-matrix/ga1.json"
import icjMatrix from "@/lib/country-matrix/icj.json"
import icrccMatrix from "@/lib/country-matrix/icrcc.json"
import uncstdMatrix from "@/lib/country-matrix/uncstd.json"
import unodcMatrix from "@/lib/country-matrix/unodc.json"
import whoMatrix from "@/lib/country-matrix/who.json"

const committeeMatrixOptions = {
  ga1: ga1Matrix,
  unodc: unodcMatrix,
  ecosoc: ecosocMatrix,
  who: whoMatrix,
  uncstd: uncstdMatrix,
  icj: icjMatrix,
  icrcc: icrccMatrix,
} as const

export const normalizeCommitteeCode = (committeeCode: string | null | undefined) =>
  (committeeCode ?? "").trim().toLowerCase()

export const getAllocationOptionsForCommittee = (committeeCode: string | null | undefined) => {
  const normalizedCode = normalizeCommitteeCode(committeeCode)
  const matrix = committeeMatrixOptions[normalizedCode as keyof typeof committeeMatrixOptions]

  if (!matrix) return []

  return matrix.rows
    .map((row) => String(row[0] ?? "").trim())
    .filter(Boolean)
}
