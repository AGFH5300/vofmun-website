// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

const getDefaultChairCutoff = () => {
  const now = new Date()
  const year = now.getUTCFullYear()

  // Jan = month 0
  const cutoffUtc = new Date(Date.UTC(year, 0, 10, 19, 59, 59))
  return cutoffUtc.toISOString()
}

const getDefaultAdminCutoff = () => {
  const now = new Date()
  const year = now.getUTCFullYear()

  // Feb = month 1
  const cutoffUtc = new Date(Date.UTC(year, 2, 15, 19, 59, 59))
  return cutoffUtc.toISOString()
}

const DEFAULT_CHAIR_SIGNUP_CUTOFF_GST = getDefaultChairCutoff()
const DEFAULT_ADMIN_SIGNUP_CUTOFF_GST = getDefaultAdminCutoff()

const getChairCutoffTimestamp = () => {
  const rawCutoff =
    process.env.NEXT_PUBLIC_CHAIR_SIGNUP_CUTOFF_GST ??
    process.env.CHAIR_SIGNUP_CUTOFF_GST ??
    DEFAULT_CHAIR_SIGNUP_CUTOFF_GST

  const parsed = new Date(rawCutoff)

  if (Number.isNaN(parsed.getTime())) {
    return new Date(DEFAULT_CHAIR_SIGNUP_CUTOFF_GST)
  }

  return parsed
}

const getAdminCutoffTimestamp = () => {
  const rawCutoff =
    process.env.NEXT_PUBLIC_ADMIN_SIGNUP_CUTOFF_GST ??
    process.env.ADMIN_SIGNUP_CUTOFF_GST ??
    DEFAULT_ADMIN_SIGNUP_CUTOFF_GST

  const parsed = new Date(rawCutoff)

  if (Number.isNaN(parsed.getTime())) {
    return new Date(DEFAULT_ADMIN_SIGNUP_CUTOFF_GST)
  }

  return parsed
}

export const CHAIR_SIGNUP_CUTOFF_GST = getChairCutoffTimestamp()
export const CHAIR_SIGNUP_CUTOFF_DISPLAY = "10th January"
export const ADMIN_SIGNUP_CUTOFF_GST = getAdminCutoffTimestamp()
export const ADMIN_SIGNUP_CUTOFF_DISPLAY = "15th March"

export const isChairSignupClosed = (reference: Date = new Date()) =>
  reference.getTime() > CHAIR_SIGNUP_CUTOFF_GST.getTime()

export const isAdminSignupClosed = (reference: Date = new Date()) =>
  reference.getTime() > ADMIN_SIGNUP_CUTOFF_GST.getTime()
