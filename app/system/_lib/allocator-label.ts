// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

const allocatorLabelsByEmail: Record<string, string> = {
  "vidur245@gmail.com": "vidur",
  "saxena.arsh@gmail.com": "arsh",
  "vmundanat@gmail.com": "vaibhav",
}

export const normalizeAllocatorInput = (value: string | null | undefined) => (value ?? "").trim().toLowerCase()

export const getAllocatorLabelFromEmail = (email: string, admin: boolean) => {
  const normalizedEmail = normalizeAllocatorInput(email)
  if (!normalizedEmail) return ""

  if (admin) {
    return `admin - ${normalizedEmail}`
  }

  return allocatorLabelsByEmail[normalizedEmail] ?? normalizedEmail
}

export const formatAllocatorDisplay = (value: string | null | undefined) => {
  const normalizedValue = normalizeAllocatorInput(value)

  if (!normalizedValue) return null
  if (normalizedValue.startsWith("admin - ")) return normalizedValue

  return allocatorLabelsByEmail[normalizedValue] ?? normalizedValue
}

