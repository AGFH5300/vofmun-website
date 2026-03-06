import { NextRequest, NextResponse } from 'next/server'

import { getReferralCodeEntry, normalizeReferralCode } from '@/lib/referral-codes'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const rawCode = typeof body?.code === 'string' ? body.code : ''
    const normalizedCode = normalizeReferralCode(rawCode)

    if (!normalizedCode) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Referral code is required.',
        },
        { status: 400 },
      )
    }

    const staticEntry = getReferralCodeEntry(normalizedCode)
    if (staticEntry?.owner) {
      return NextResponse.json({
        status: 'success',
        owner: staticEntry.owner,
        code: normalizedCode,
      })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('own_referral_code', normalizedCode)
      .limit(1)

    if (error) {
      throw new Error(`Failed referral owner lookup: ${error.message}`)
    }

    const user = data?.[0]
    if (!user) {
      return NextResponse.json(
        {
          status: 'not_found',
          code: normalizedCode,
        },
        { status: 404 },
      )
    }

    const ownerName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || 'a registered delegate'

    return NextResponse.json({
      status: 'success',
      owner: ownerName,
      code: normalizedCode,
    })
  } catch (error) {
    console.error('Failed to resolve referral code owner:', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Unable to verify referral code owner right now.',
      },
      { status: 500 },
    )
  }
}
