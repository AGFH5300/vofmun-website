// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

export type ReferralCodeEntry = {
  code: string
  owner: string
}

export const REFERRAL_CODES: ReferralCodeEntry[] = [
  { code: 'AG404', owner: 'Ansh Gupta' },
  { code: 'VS224', owner: 'Vihaan Shukla' },
  { code: 'TSW67', owner: 'Tala Swaidan' },
  { code: 'KA123', owner: 'Kabeer Anil' },
  { code: 'VM284', owner: 'Vaibhav Kiran Mundanat' },
  { code: 'AS831', owner: 'Armaghan Siddiqui' },
  { code: 'VP804', owner: 'Vyom Patel' },
  { code: 'VK245', owner: 'Vidur Aravind Kumar' },
  { code: 'AS812', owner: 'Aryan Shah' },
  
  { code: 'AS696', owner: 'Arsh Saxena' },
  { code: 'VH123', owner: 'Vihaan Harrison'},
  { code: 'SRS14', owner: 'Saira Shirvaikar' },
  { code: 'PS123', owner: 'Prakhar Sinha' },
  { code: 'TM123', owner: 'Tamara Moshawrab' },
  { code: 'PV556', owner: 'Pranav Verma' },
  { code: 'NQ123', owner: 'Noaf Qassem' },
]

export const CHAIR_REFERRAL_CODES: ReferralCodeEntry[] = [
  { code: 'MA123', owner: 'Manahil Ahmed' },
  { code: 'RM041', owner: 'Rayan Makwana' },
  { code: 'JA069', owner: 'Jay Alama' },
  { code: 'AR123', owner: 'Adithya Rajesh' },
  { code: 'MD161', owner: 'Milind Deepak' },
  { code: 'SK420', owner: 'Shraddha Krishnan' },
  { code: 'SP123', owner: 'Sanithi Perera' },
  { code: 'PM123', owner: 'Parth Menon' },
  { code: 'SA667', owner: 'Sarang Anilkumar' },
  { code: 'RA679', owner: 'Rudra Adwani' },
  { code: 'SM025', owner: 'Saanchi Moudgil' },
  { code: 'MH670', owner: 'Mariyam Hafiza' },
  { code: 'FK123', owner: 'Faiz Khan' },
  { code: 'VS034', owner: 'Vishesh Shah' },
  { code: 'RJ067', owner: 'Rohith John Saldanha' },
  { code: 'AR067', owner: 'Aditya Rajesh' },
  { code: 'OT500', owner: 'Oshian Thada' },
  { code: 'DB241', owner: 'David Botros' },
  { code: 'HC123', owner: 'Hussain Chandra' },
  { code: 'YD272', owner: 'Yuvraj Dewan' },
  { code: 'AP005', owner: 'Arnav AjayKumar Payyaram' },
  { code: 'AA100', owner: 'Avyukta Pragnya Raja Ankam' },
  { code: 'AA123', owner: 'Anaika Agarwal' },
]

export const SEC_REFERRAL_CODES: ReferralCodeEntry[] = REFERRAL_CODES

export const ALL_REFERRAL_CODES: ReferralCodeEntry[] = [
  ...SEC_REFERRAL_CODES,
  ...CHAIR_REFERRAL_CODES,
]

const normalizedLookup = new Map(
  ALL_REFERRAL_CODES.map((entry) => [entry.code.toUpperCase(), entry]),
)

export const DEFAULT_REFERRAL_SUGGESTION_DISTANCE = 2

export function normalizeReferralCode(input: string): string {
  return input.trim().toUpperCase()
}

export function getReferralCodeEntry(code: string) {
  const normalized = normalizeReferralCode(code)
  return normalizedLookup.get(normalized) ?? null
}

export function isValidReferralCode(code: string): boolean {
  if (!code) return false
  return normalizedLookup.has(normalizeReferralCode(code))
}

export function findReferralSuggestions(
  input: string,
  maxDistance = DEFAULT_REFERRAL_SUGGESTION_DISTANCE,
): ReferralCodeEntry[] {
  const normalized = normalizeReferralCode(input)
  if (!normalized) return []

  const distances = ALL_REFERRAL_CODES.map((entry) => ({
    entry,
    distance: levenshtein(normalized, entry.code),
  }))

  return distances
    .filter(({ distance }) => distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .map(({ entry }) => entry)
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = Array.from({ length: a.length + 1 }, () => [])

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      )
    }
  }

  return matrix[a.length][b.length]
}
