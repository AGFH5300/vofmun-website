// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

export const allocationStatuses = ["pending", "allocated", "unallocated"] as const

export type AllocationStatus = (typeof allocationStatuses)[number]

export type DelegateAllocationData = {
  experience?: string | null
  committee1?: string | null
  committee2?: string | null
  committee3?: string | null
}

export type AllocationUserRow = {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  school: string | null
  grade: string | null
  delegate_data: DelegateAllocationData | null
  allocated_committee_code: string | null
  allocated_country_code: string | null
  allocation_status: AllocationStatus | null
  updated_at: string
}
