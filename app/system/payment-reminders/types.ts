// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

export type EligibleRecipient = {
  id: number
  name: string
  firstName: string | null
  lastName: string | null
  email: string | null
  paymentStatus: string | null
  reminderCount: number
  lastReminderAt: string | null
}
