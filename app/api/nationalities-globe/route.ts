// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { normalizeToAlpha2CountryCode } from '@/lib/countries'

export const dynamic = 'force-dynamic'

const CACHE_TTL_MS = 90_000
let cachedResponse: { expiresAt: number; payload: NationalitiesResponse } | null = null
let inFlightRequest: Promise<NationalitiesResponse> | null = null

type NationalityRow = Record<string, unknown>
type NationalitiesResponse = { counts: Record<string, number>; totalDelegates: number; totalNationalities: number; lastUpdated: string }

function pickText(row: NationalityRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return null
}

function pickCount(row: NationalityRow): number {
  const candidates = ['count', 'participants', 'delegates', 'delegate_count', 'total']

  for (const key of candidates) {
    const value = row[key]
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(0, Math.floor(value))
    }
    if (typeof value === 'string') {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return Math.max(0, Math.floor(parsed))
      }
    }
  }

  return 1
}


async function loadNationalities(): Promise<NationalitiesResponse> {
  const now = Date.now()
  if (cachedResponse && cachedResponse.expiresAt > now) {
    return cachedResponse.payload
  }

  if (inFlightRequest) {
    return inFlightRequest
  }

  inFlightRequest = (async () => {
    const supabase = await createClient()
    const { data, error } = await supabase.from('users').select('nationality')
    if (error) throw error

    const counts: Record<string, number> = {}
    ;(data as NationalityRow[] | null)?.forEach((row) => {
      const rawCountry = pickText(row, ['nationality'])
      if (!rawCountry) return
      const normalizedCode = normalizeToAlpha2CountryCode(rawCountry)
      if (!normalizedCode) return
      counts[normalizedCode] = (counts[normalizedCode] || 0) + pickCount(row)
    })

    const totalDelegates = Object.values(counts).reduce((sum, value) => sum + value, 0)
    const payload = {
      counts,
      totalDelegates,
      totalNationalities: Object.keys(counts).length,
      lastUpdated: new Date().toISOString(),
    }
    cachedResponse = { expiresAt: Date.now() + CACHE_TTL_MS, payload }
    return payload
  })()

  try {
    return await inFlightRequest
  } finally {
    inFlightRequest = null
  }
}

export async function GET() {
  try {
    const payload = await loadNationalities()
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=90, stale-while-revalidate=60',
      },
    })
  } catch (error) {
    console.error('Error fetching live nationalities data:', error)
    return NextResponse.json({ error: 'Failed to fetch live nationalities data' }, { status: 500 })
  }
}
