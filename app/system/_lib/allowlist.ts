// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

export function parseEmailAllowList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

export function getSystemAllowLists() {
  const admins = parseEmailAllowList(process.env.SYSTEM_ADMIN_EMAILS)
  const allocators = parseEmailAllowList(process.env.SYSTEM_ALLOCATOR_EMAILS)

  return {
    admins,
    allocators,
  }
}

export function normalizeEmail(email: string | undefined | null) {
  return (email ?? "").trim().toLowerCase()
}

export function isSystemAdmin(email: string | undefined | null) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return false

  const { admins } = getSystemAllowLists()
  return admins.length > 0 ? admins.includes(normalizedEmail) : false
}

export function canAccessAllocations(email: string | undefined | null) {
  const normalizedEmail = normalizeEmail(email)
  if (!normalizedEmail) return false

  const { admins, allocators } = getSystemAllowLists()
  const allowedEmails = new Set([...admins, ...allocators])

  return allowedEmails.size > 0 ? allowedEmails.has(normalizedEmail) : false
}
