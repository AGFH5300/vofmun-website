// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyUploadReference } from '@/lib/uploads/intent'
import { rejectLargeJsonRequest } from '@/lib/http/request-size'

import { createClient } from '@/utils/supabase/server'
import {
  getPaymentProofBucketName,
  PaymentProofBucketError,
} from '@/utils/supabase/storage'

export const runtime = 'nodejs'

const paymentProofSchema = z.object({
  email: z.string().email('Please provide the email you used to register'),
  fullName: z.string().min(1, "Payment confirmation requires the payer's name"),
  role: z.enum(['delegate', 'chair', 'admin']),
  paymentProof: z.object({
    uploadReference: z.unknown(),
  }).strict(),
})

export async function POST(request: NextRequest) {
  const tooLarge = rejectLargeJsonRequest(request, 64 * 1024)
  if (tooLarge) return tooLarge

  let uploadedStoragePath: string | null = null
  try {
    const body = await request.json()
    const payload = paymentProofSchema.parse(body)

    const supabase = await createClient()

    const normalizedEmail = payload.email.trim()
    const escapedEmailPattern = normalizedEmail.replace(/([%_\\])/g, '\\$1')

    const { data: matchingUsers, error: lookupError } = await supabase
      .from('users')
      .select('id, role, registration_status, payment_proof_storage_path')
      .ilike('email', escapedEmailPattern)
      .eq('role', payload.role)

    if (lookupError) {
      throw new Error('Failed to verify registration before uploading proof: ' + lookupError.message)
    }

    if (!matchingUsers || matchingUsers.length === 0) {
      return NextResponse.json(
        {
          status: 'not_found',
          message:
            'We could not find a registration with that email and role. Please choose the role you registered with or complete the signup form first.',
        },
        { status: 404 }
      )
    }

    const existingUser = matchingUsers[0]
    const normalizedRegistrationStatus = `${existingUser.registration_status ?? 'pending'}`.toLowerCase()
    const isLeadershipRole = payload.role === 'chair' || payload.role === 'admin'

    if (isLeadershipRole && normalizedRegistrationStatus !== 'confirmed') {
      return NextResponse.json(
        {
          status: 'registration_not_confirmed',
          message:
            'Your registration was found, but chair/admin payment proof uploads are only available after your registration status is confirmed. If you believe this is a mistake, please contact support.',
        },
        { status: 403 }
      )
    }

    const paymentProofBucket = getPaymentProofBucketName()
    const uploadReference = verifyUploadReference(payload.paymentProof.uploadReference, 'payment-proof', paymentProofBucket)

    if (uploadReference.bucket !== paymentProofBucket) {
      throw new Error('Payment proof upload bucket is not configured for this deployment.')
    }

    const pathParts = uploadReference.path.split('/')
    const fileName = pathParts.pop()
    const folder = pathParts.join('/')
    const { data: objects, error: objectLookupError } = await supabase.storage
      .from(paymentProofBucket)
      .list(folder, { search: fileName, limit: 1 })

    if (objectLookupError) {
      throw new Error('Failed to verify payment proof upload: ' + objectLookupError.message)
    }

    if (!fileName || !objects?.some((object) => object.name === fileName)) {
      throw new Error('Payment proof upload was not found. Please upload the file again.')
    }

    const { data: publicUrlData } = supabase.storage.from(paymentProofBucket).getPublicUrl(uploadReference.path)
    uploadedStoragePath = uploadReference.path

    const paymentProofUploadedAt = new Date().toISOString()

    const { data: updatedUsers, error: updateError } = await supabase
      .from('users')
      .update({
        payment_status: 'pending',
        payment_proof_url: publicUrlData?.publicUrl ?? null,
        payment_proof_storage_path: uploadReference.path,
        payment_proof_file_name: uploadReference.fileName,
        payment_proof_payer_name: payload.fullName.trim(),
        payment_proof_role: payload.role,
        payment_proof_uploaded_at: paymentProofUploadedAt,
      })
      .eq('id', existingUser.id)
      .select('id')

    if (updateError) {
      throw new Error('Failed to record payment proof: ' + updateError.message)
    }

    if (!updatedUsers || updatedUsers.length === 0) {
      await supabase.storage.from(paymentProofBucket).remove([uploadReference.path]).catch((removeError) => {
        console.error('Failed to remove unmatched payment proof upload:', removeError instanceof Error ? removeError.message : 'Unknown error')
      })
      uploadedStoragePath = null
      return NextResponse.json(
        {
          status: 'not_found',
          message: 'We could not find a registration with that email. Please complete the signup form first.',
        },
        { status: 404 }
      )
    }

    const previousStoragePath = existingUser.payment_proof_storage_path as string | null | undefined

    if (previousStoragePath && previousStoragePath !== uploadReference.path) {
      await supabase.storage.from(paymentProofBucket).remove([previousStoragePath]).catch((error) => {
        console.error('Failed to remove previous payment proof from storage:', error)
      })
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Proof of payment received! Our finance team will verify it shortly.',
        uploadedAt: paymentProofUploadedAt,
      },
      { status: 200 }
    )
  } catch (error) {
    if (uploadedStoragePath) {
      await (await createClient()).storage.from(getPaymentProofBucketName()).remove([uploadedStoragePath]).catch((removeError) => {
        console.error('Failed to remove unrecorded payment proof upload:', removeError instanceof Error ? removeError.message : 'Unknown error')
      })
    }

    if (error instanceof PaymentProofBucketError) {
      console.error('Payment proof bucket misconfiguration:', error.message)

      return NextResponse.json(
        {
          status: 'error',
          message: error.userFacingMessage,
        },
        { status: 500 }
      )
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: 'validation_error',
          message: 'Please double-check the information you entered and try again.',
          issues: error.flatten(),
        },
        { status: 422 }
      )
    }

    console.error('Error handling payment proof upload:', error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Something went wrong while saving your payment proof. Please try again or contact support.',
      },
      { status: 500 }
    )
  }
}
