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
