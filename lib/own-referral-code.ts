// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

export function generateOwnReferralCode(firstName: string, lastName: string) {
  const firstInitial = firstName.trim().charAt(0).toUpperCase() || 'X'
  const lastInitial = lastName.trim().charAt(0).toUpperCase() || 'X'
  const randomDigits = Math.floor(Math.random() * 1000).toString().padStart(3, '0')

  return `${firstInitial}${lastInitial}${randomDigits}`
}
