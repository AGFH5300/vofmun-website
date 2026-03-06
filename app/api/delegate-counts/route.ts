// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { normalizeToAlpha2CountryCode } from '@/lib/countries'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: users, error } = await supabase
      .from('users')
      .select('nationality')
    
    if (error) {
      throw error
    }
    
    const counts: Record<string, number> = {}
    
    users?.forEach((user) => {
      if (user.nationality) {
        const normalizedCode = normalizeToAlpha2CountryCode(user.nationality)
        if (!normalizedCode) {
          return
        }
        counts[normalizedCode] = (counts[normalizedCode] || 0) + 1
      }
    })
    
    return NextResponse.json(
      { counts },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('Error fetching participant nationality counts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch participant nationality counts' },
      { status: 500 }
    )
  }
}
