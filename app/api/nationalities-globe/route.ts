// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { normalizeToAlpha2CountryCode } from '@/lib/countries'

export const dynamic = 'force-dynamic'

type NationalityRow = Record<string, unknown>

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

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from('users').select('nationality')

    if (error) {
      throw error
    }

    const counts: Record<string, number> = {}

    ;(data as NationalityRow[] | null)?.forEach((row) => {
      const rawCountry = pickText(row, ['nationality'])

      if (!rawCountry) {
        return
      }

      const normalizedCode = normalizeToAlpha2CountryCode(rawCountry)

      if (!normalizedCode) {
        return
      }

      counts[normalizedCode] = (counts[normalizedCode] || 0) + pickCount(row)
    })

    const totalDelegates = Object.values(counts).reduce((sum, value) => sum + value, 0)

    return NextResponse.json(
      {
        counts,
        totalDelegates,
        totalNationalities: Object.keys(counts).length,
        lastUpdated: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      },
    )
  } catch (error) {
    console.error('Error fetching live nationalities data:', error)
    return NextResponse.json({ error: 'Failed to fetch live nationalities data' }, { status: 500 })
  }
}
