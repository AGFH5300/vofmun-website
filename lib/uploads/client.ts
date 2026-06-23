// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { createClient } from '@/utils/supabase/client'
import { validateUploadMetadata, type UploadPurpose } from './config'
import type { UploadReference } from './intent'

type SignResponse = {
  bucket: string
  path: string
  token: string
  uploadReference: UploadReference
}

export async function uploadFileDirectly(purpose: UploadPurpose, file: File) {
  const validationError = validateUploadMetadata({ purpose, fileName: file.name, mimeType: file.type, size: file.size })
  if (validationError) throw new Error(validationError)

  const signResponse = await fetch('/api/uploads/sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ purpose, fileName: file.name, mimeType: file.type, size: file.size }),
  })
  const signed = (await signResponse.json().catch(() => null)) as (SignResponse & { message?: string }) | null
  if (!signResponse.ok || !signed) throw new Error(signed?.message || 'Unable to prepare the upload. Please try again.')

  const supabase = createClient()
  const { error } = await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path, signed.token, file, {
    contentType: file.type || 'application/octet-stream',
  })
  if (error) throw new Error('Unable to upload the file. Please try again.')
  return signed.uploadReference
}
