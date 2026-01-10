const getDefaultChairCutoff = () => {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = now.getUTCMonth()
  const cutoffUtc = new Date(Date.UTC(year, month, 10, 19, 59, 59))
  return cutoffUtc.toISOString()
}

const DEFAULT_CHAIR_SIGNUP_CUTOFF_GST = getDefaultChairCutoff()

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

export const CHAIR_SIGNUP_CUTOFF_GST = getChairCutoffTimestamp()
export const CHAIR_SIGNUP_CUTOFF_DISPLAY = "10th at 11:59 PM GST"

export const isChairSignupClosed = (reference: Date = new Date()) =>
  reference.getTime() > CHAIR_SIGNUP_CUTOFF_GST.getTime()
