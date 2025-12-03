export type ReferralCodeEntry = {
  code: string
  owner: string
}

export const REFERRAL_CODES: ReferralCodeEntry[] = [
  { code: 'AG404', owner: 'Ansh Gupta' },
  { code: 'VS224', owner: 'Vihaan Shukla' },
  { code: 'TSW67', owner: 'Tala Swaidan' },
  { code: 'VM284', owner: 'Vaibhav Kiran Mundanat' },
  { code: 'GM777', owner: 'Gibran Malaeb' },
  { code: 'AS831', owner: 'Armaghan Siddiqui' },
  { code: 'VP804', owner: 'Vyom Patel' },
  { code: 'VK245', owner: 'Vidur Aravind Kumar' },
]

const normalizedLookup = new Map(
  REFERRAL_CODES.map((entry) => [entry.code.toUpperCase(), entry]),
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

  const distances = REFERRAL_CODES.map((entry) => ({
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
