// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { createHmac, timingSafeEqual } from 'crypto'
import { z } from 'zod'
import { getUploadConfig, type UploadPurpose } from './config'

export const uploadReferenceSchema = z.object({
  purpose: z.enum(['payment-proof', 'chair-cv', 'school-delegation-spreadsheet']),
  bucket: z.string().min(1),
  path: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().int().positive(),
  expiresAt: z.string().datetime(),
  signature: z.string().min(32),
})

export type UploadReference = z.infer<typeof uploadReferenceSchema>

const getSecret = () => {
  const secret = process.env.UPLOAD_INTENT_SECRET
  if (!secret || secret.length < 32) throw new Error('UPLOAD_INTENT_SECRET is not configured.')
  return secret
}

const signingPayload = (ref: Omit<UploadReference, 'signature'>) =>
  [ref.purpose, ref.bucket, ref.path, ref.fileName, ref.mimeType, ref.size, ref.expiresAt].join('\n')

export const signUploadReference = (ref: Omit<UploadReference, 'signature'>): UploadReference => ({
  ...ref,
  signature: createHmac('sha256', getSecret()).update(signingPayload(ref)).digest('hex'),
})

export const verifyUploadReference = (input: unknown, expectedPurpose: UploadPurpose, expectedBucket?: string) => {
  const ref = uploadReferenceSchema.parse(input)
  const { signature, ...unsigned } = ref
  const expected = signUploadReference(unsigned).signature
  const actualBuffer = Buffer.from(signature, 'hex')
  const expectedBuffer = Buffer.from(expected, 'hex')
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
    throw new Error('Upload reference could not be verified.')
  }
  if (ref.purpose !== expectedPurpose) throw new Error('Upload purpose does not match this form.')
  if (Date.parse(ref.expiresAt) <= Date.now()) throw new Error('Upload reference has expired. Please reselect the file and try again.')
  const config = getUploadConfig(expectedPurpose)
  if (ref.bucket !== (expectedBucket ?? config.bucket)) throw new Error('Upload bucket is not valid for this form.')
  if (!ref.path.startsWith(`${config.prefix}/`)) throw new Error('Upload path is not valid for this form.')
  if (ref.path.includes('..') || ref.path.startsWith('/')) throw new Error('Upload path is not valid.')
  return ref
}
