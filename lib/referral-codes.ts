export type ReferralCodeEntry = {
  code: string
  owner: string
}

export const REFERRAL_CODES: ReferralCodeEntry[] = [
  { code: 'AG7KQ', owner: 'Ansh Gupta' },
  { code: 'VS9F2', owner: 'Vihaan Shukla' },
  { code: 'TSX8M', owner: 'Tala Swaidan' },
  { code: 'VM4ZP', owner: 'Vaibhav Kiran Mundanat' },
  { code: 'GMQ37', owner: 'Gibran Malaeb' },
  { code: 'AS2LD', owner: 'Armaghan Siddiqui' },
  { code: 'ESJ6R', owner: 'Elinore Sweiss' },
  { code: 'CR8TN', owner: 'Clyde Jared Robis' },
  { code: 'AS5WD', owner: 'Aryan Shah' },
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
