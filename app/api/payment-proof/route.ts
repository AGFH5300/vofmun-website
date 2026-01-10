import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { z } from 'zod'

import { createClient } from '@/utils/supabase/server'
import {
  ensurePaymentProofBucketExists,
  getManualBucketSetupChecklist,
  getPaymentProofBucketName,
  PaymentProofBucketError,
} from '@/utils/supabase/storage'

export const runtime = 'nodejs'

const paymentProofSchema = z.object({
  email: z.string().email('Please provide the email you used to register'),
  fullName: z.string().min(1, "Payment confirmation requires the payer's name"),
  role: z.enum(['delegate', 'chair', 'admin']),
  paymentProof: z
    .object({
      fileName: z.string().min(1),
      mimeType: z.string().min(1),
      dataUrl: z.string().regex(/^data:.*;base64,.+/, 'Invalid payment proof format'),
    })
    .refine(
      (proof) => proof.mimeType.startsWith('image/') || proof.mimeType === 'application/pdf',
      {
        message: 'Payment proof must be an image or PDF file.',
        path: ['mimeType'],
      },
    ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const payload = paymentProofSchema.parse(body)

    const supabase = await createClient()

    const normalizedEmail = payload.email.trim()
    const escapedEmailPattern = normalizedEmail.replace(/([%_\\])/g, '\\$1')

    const { data: matchingUsers, error: lookupError } = await supabase
      .from('users')
      .select('id, role, payment_proof_storage_path')
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

    const [, base64Data] = payload.paymentProof.dataUrl.split(',')
    if (!base64Data) {
      throw new Error('Invalid payment proof payload received')
    }

    const fileBuffer = Buffer.from(base64Data, 'base64')

    const rawFileName = payload.paymentProof.fileName.trim() || 'payment-proof'
    const sanitizedFileName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const hasExtension = sanitizedFileName.includes('.')
    const mimeExtension = payload.paymentProof.mimeType.split('/')[1] || 'png'
    const fileNameWithExtension = hasExtension ? sanitizedFileName : `${sanitizedFileName}.${mimeExtension}`

    const storagePath = `proof-of-payment/${new Date().toISOString().split('T')[0]}/${randomUUID()}-${fileNameWithExtension}`

    const paymentProofBucket = getPaymentProofBucketName()

    await ensurePaymentProofBucketExists(paymentProofBucket)

    const { error: uploadError } = await supabase.storage
      .from(paymentProofBucket)
      .upload(storagePath, fileBuffer, {
        contentType: payload.paymentProof.mimeType,
        upsert: false,
      })

    if (uploadError) {
      const normalizedMessage = uploadError.message?.toLowerCase() ?? ''
      if (normalizedMessage.includes('bucket not found')) {
        const manualSetupMessage = getManualBucketSetupChecklist(paymentProofBucket)
        throw new PaymentProofBucketError(
          `Failed to upload payment proof: Supabase storage bucket "${paymentProofBucket}" was not found.\n\n${manualSetupMessage}`,
          'Payment proof uploads are temporarily unavailable while we finish setting up storage. Please try again later or contact support.'
        )
      }

      throw new Error('Failed to upload payment proof: ' + uploadError.message)
    }

    const { data: publicUrlData } = supabase.storage.from(paymentProofBucket).getPublicUrl(storagePath)

    const paymentProofUploadedAt = new Date().toISOString()

    const { data: updatedUsers, error: updateError } = await supabase
      .from('users')
      .update({
        payment_status: 'pending',
        payment_proof_url: publicUrlData?.publicUrl ?? null,
        payment_proof_storage_path: storagePath,
        payment_proof_file_name: fileNameWithExtension,
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
      return NextResponse.json(
        {
          status: 'not_found',
          message: 'We could not find a registration with that email. Please complete the signup form first.',
        },
        { status: 404 }
      )
    }

    const previousStoragePath = existingUser.payment_proof_storage_path as string | null | undefined

    if (previousStoragePath && previousStoragePath !== storagePath) {
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
