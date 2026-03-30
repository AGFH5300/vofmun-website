// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import ecosocMatrix from "@/lib/country-matrix/ecosoc.json"
import ga1Matrix from "@/lib/country-matrix/ga1.json"
import icrccMatrix from "@/lib/country-matrix/icrcc.json"
import unscMatrix from "@/lib/country-matrix/unsc.json"
import unodcMatrix from "@/lib/country-matrix/unodc.json"
import unhrcMatrix from "@/lib/country-matrix/unhrc.json"

const committeeMatrixOptions = {
  ga1: ga1Matrix,
  unodc: unodcMatrix,
  ecosoc: ecosocMatrix,
  unhrc: unhrcMatrix,
  unsc: unscMatrix,
  icrcc: icrccMatrix,
} as const

export const allocationCommitteeCodes = Object.keys(committeeMatrixOptions) as Array<keyof typeof committeeMatrixOptions>

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
