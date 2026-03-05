// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { sendDelegateReferralCodeEmail } from '@/lib/email/registration'
import { generateOwnReferralCode } from '@/lib/own-referral-code'

export const runtime = 'nodejs'

const SUCCESS_MESSAGE = 'Your referral code has been sent to your email.'
const USER_NOT_FOUND_MESSAGE = "We couldn't find a registered delegate with that email."
const RATE_LIMIT_MESSAGE = 'Too many requests. Please wait a few minutes before trying again.'
const REQUEST_SCHEMA = z.object({
  email: z.string().email('Please enter a valid email address'),
})

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5
const requestBuckets = new Map<string, { count: number; resetAt: number }>()

type ExistingUserRecord = {
  id: number
  email: string
  role: string
  first_name: string | null
  last_name: string | null
  own_referral_code: string | null
}

function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase service role credentials are not configured')
  }

  return createClient(supabaseUrl, serviceRoleKey)
}

function applyRateLimit(request: NextRequest, normalizedEmail: string) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const ipAddress = forwardedFor?.split(',')[0]?.trim() || realIp || 'unknown'
  const key = `${ipAddress}:${normalizedEmail}`
  const now = Date.now()

  const current = requestBuckets.get(key)
  if (!current || now > current.resetAt) {
    requestBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  current.count += 1
  return false
}

async function codeExistsAnywhere(code: string) {
  const supabase = createSupabaseAdminClient()

  const [ownCodeMatch, jsonbCodeMatch] = await Promise.all([
    supabase
      .from('users')
      .select('id')
      .eq('own_referral_code', code)
      .limit(1),
    supabase
      .from('users')
      .select('id')
      .contains('referral_codes', [code])
      .limit(1),
  ])

  if (ownCodeMatch.error) {
    throw new Error(`Failed own_referral_code uniqueness check: ${ownCodeMatch.error.message}`)
  }

  if (jsonbCodeMatch.error) {
    throw new Error(`Failed referral_codes uniqueness check: ${jsonbCodeMatch.error.message}`)
  }

  return Boolean(ownCodeMatch.data?.length || jsonbCodeMatch.data?.length)
}

async function generateUniqueCode(firstName: string, lastName: string) {
  const maxAttempts = 1000

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const candidate = generateOwnReferralCode(firstName, lastName)
    const exists = await codeExistsAnywhere(candidate)

    if (!exists) {
      return candidate
    }
  }

  throw new Error('Unable to generate a globally unique referral code after multiple attempts')
}


function getTrimmedNameParts(user: ExistingUserRecord) {
  const firstName = user.first_name?.trim() ?? ''
  const lastName = user.last_name?.trim() ?? ''

  if (!firstName || !lastName) {
    return null
  }

  return { firstName, lastName }
}

async function sendReferralCodeEmail(user: ExistingUserRecord, code: string) {
  await sendDelegateReferralCodeEmail({
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    referralCode: code,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = REQUEST_SCHEMA.parse(body)

    const normalizedEmail = payload.email.trim().toLowerCase()

    if (applyRateLimit(request, normalizedEmail)) {
      return NextResponse.json({ status: 'rate_limited', message: RATE_LIMIT_MESSAGE }, { status: 429 })
    }

    const supabase = createSupabaseAdminClient()
    const escapedEmailPattern = normalizedEmail.replace(/([%_\\])/g, '\\$1')

    const { data: users, error: lookupError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name, own_referral_code')
      .ilike('email', escapedEmailPattern)
      .limit(1)

    if (lookupError) {
      throw new Error(`Failed to find user by email: ${lookupError.message}`)
    }

    const user = users?.[0] as ExistingUserRecord | undefined

    if (!user || user.role !== 'delegate') {
      return NextResponse.json({ status: 'not_found', message: USER_NOT_FOUND_MESSAGE }, { status: 404 })
    }

    const nameParts = getTrimmedNameParts(user)
    if (!nameParts) {
      return NextResponse.json({ status: 'not_found', message: USER_NOT_FOUND_MESSAGE }, { status: 404 })
    }

    const emailedAt = new Date().toISOString()

    if (user.own_referral_code) {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          own_referral_code_emailed_at: emailedAt,
        })
        .eq('id', user.id)

      if (updateError) {
        throw new Error(`Failed to update own_referral_code_emailed_at: ${updateError.message}`)
      }

      await sendReferralCodeEmail(user, user.own_referral_code)
      return NextResponse.json({ status: 'success', message: SUCCESS_MESSAGE }, { status: 200 })
    }

    const generatedCode = await generateUniqueCode(nameParts.firstName, nameParts.lastName)

    const { data: updatedUsers, error: createCodeError } = await supabase
      .from('users')
      .update({
        own_referral_code: generatedCode,
        own_referral_code_generated_at: emailedAt,
        own_referral_code_emailed_at: emailedAt,
      })
      .eq('id', user.id)
      .is('own_referral_code', null)
      .select('own_referral_code')

    if (createCodeError) {
      if ((createCodeError as { code?: string }).code === '23505') {
        const { data: latestUser } = await supabase
          .from('users')
          .select('own_referral_code')
          .eq('id', user.id)
          .limit(1)

        const alreadySavedCode = latestUser?.[0]?.own_referral_code as string | null | undefined
        if (alreadySavedCode) {
          await sendReferralCodeEmail(user, alreadySavedCode)
          return NextResponse.json({ status: 'success', message: SUCCESS_MESSAGE }, { status: 200 })
        }
      }

      throw new Error(`Failed to save own_referral_code: ${createCodeError.message}`)
    }

    const finalCode = (updatedUsers?.[0]?.own_referral_code as string | undefined) ?? generatedCode

    await sendReferralCodeEmail(user, finalCode)

    return NextResponse.json({ status: 'success', message: SUCCESS_MESSAGE }, { status: 200 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: 'validation_error',
          message: 'Please enter a valid email address.',
          issues: error.flatten(),
        },
        { status: 422 },
      )
    }

    console.error('Failed delegate referral code request:', error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Something went wrong while processing your request. Please try again later.',
      },
      { status: 500 },
    )
  }
}
