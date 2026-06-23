// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { getUploadConfig, sanitizeFileName, validateUploadMetadata } from '@/lib/uploads/config'
import { signUploadReference } from '@/lib/uploads/intent'
import { rejectLargeJsonRequest } from '@/lib/http/request-size'
import {
  ensureChairCvBucketExists,
  ensureDelegationSpreadsheetBucketExists,
  ensurePaymentProofBucketExists,
  getChairCvBucketName,
  getDelegationSpreadsheetBucketName,
  getPaymentProofBucketName,
} from '@/utils/supabase/storage'

export const runtime = 'nodejs'

const requestSchema = z.object({
  purpose: z.enum(['payment-proof', 'chair-cv', 'school-delegation-spreadsheet']),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
})

const resolveBucket = (purpose: z.infer<typeof requestSchema>['purpose']) => {
  if (purpose === 'payment-proof') return getPaymentProofBucketName()
  if (purpose === 'chair-cv') return getChairCvBucketName()
  return getDelegationSpreadsheetBucketName()
}

const ensureBucket = async (purpose: z.infer<typeof requestSchema>['purpose'], bucket: string) => {
  if (purpose === 'payment-proof') return ensurePaymentProofBucketExists(bucket)
  if (purpose === 'chair-cv') return ensureChairCvBucketExists(bucket)
  return ensureDelegationSpreadsheetBucketExists(bucket)
}

export async function POST(request: NextRequest) {
  const tooLarge = rejectLargeJsonRequest(request, 16 * 1024)
  if (tooLarge) return tooLarge

  try {
    const body = await request.json()
    const parsed = requestSchema.parse(body)
    const validationError = validateUploadMetadata(parsed)
    if (validationError) {
      return NextResponse.json({ status: 'validation_error', message: validationError }, { status: 422 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ status: 'error', message: 'Uploads are temporarily unavailable. Please contact support.' }, { status: 503 })
    }

    const config = getUploadConfig(parsed.purpose)
    const bucket = resolveBucket(parsed.purpose)
    await ensureBucket(parsed.purpose, bucket)

    const datePrefix = new Date().toISOString().split('T')[0]
    const safeName = sanitizeFileName(parsed.fileName, parsed.purpose)
    const path = `${config.prefix}/${datePrefix}/${randomUUID()}-${safeName}`
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data, error } = await adminClient.storage.from(bucket).createSignedUploadUrl(path)
    if (error || !data?.token) {
      console.error('Failed to create signed upload URL:', error?.message)
      return NextResponse.json({ status: 'error', message: 'Unable to prepare the upload. Please try again.' }, { status: 500 })
    }

    const uploadReference = signUploadReference({
      purpose: parsed.purpose,
      bucket,
      path,
      fileName: safeName,
      mimeType: parsed.mimeType.toLowerCase().split(';')[0]?.trim() ?? parsed.mimeType,
      size: parsed.size,
      expiresAt,
    })

    return NextResponse.json({ bucket, path, token: data.token, uploadReference }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ status: 'validation_error', message: 'Invalid upload metadata.' }, { status: 422 })
    }
    console.error('Upload signing failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ status: 'error', message: 'Unable to prepare the upload. Please try again.' }, { status: 500 })
  }
}
