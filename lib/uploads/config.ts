// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

export type UploadPurpose = 'payment-proof' | 'chair-cv' | 'school-delegation-spreadsheet'

export type UploadValidationInput = {
  purpose: UploadPurpose
  fileName: string
  mimeType: string
  size: number
}

export type UploadPurposeConfig = {
  bucket: string
  prefix: string
  maxBytes: number
  allowedMimeTypes: Record<string, readonly string[]>
  userMessage: string
}

const mb = (value: number) => value * 1024 * 1024

export const uploadPurposeConfigs: Record<UploadPurpose, UploadPurposeConfig> = {
  'payment-proof': {
    bucket: 'payment-proofs',
    prefix: 'proof-of-payment',
    maxBytes: mb(5),
    allowedMimeTypes: {
      'application/pdf': ['pdf'],
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/heic': ['heic'],
      'image/heif': ['heif'],
      'image/webp': ['webp'],
    },
    userMessage: 'Please upload a PNG, JPG, HEIC, WEBP, or PDF file up to 5 MB.',
  },
  'chair-cv': {
    bucket: 'chair-cvs',
    prefix: 'chair-cvs',
    maxBytes: mb(5),
    allowedMimeTypes: {
      'application/pdf': ['pdf'],
      'application/msword': ['doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    },
    userMessage: 'Please upload a PDF or Word document up to 5 MB.',
  },
  'school-delegation-spreadsheet': {
    bucket: 'school-delegation-spreadsheets',
    prefix: 'school-delegations',
    maxBytes: mb(10),
    allowedMimeTypes: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
      'application/vnd.ms-excel': ['xls'],
      'application/vnd.ms-excel.sheet.macroenabled.12': ['xlsm'],
      'application/vnd.oasis.opendocument.spreadsheet': ['ods'],
      'text/csv': ['csv'],
      'application/csv': ['csv'],
      'text/tab-separated-values': ['tsv'],
    },
    userMessage: 'Please upload one of the supported spreadsheet files up to 10 MB.',
  },
}

export const getUploadConfig = (purpose: UploadPurpose) => uploadPurposeConfigs[purpose]

export const getUploadMaxSizeLabel = (purpose: UploadPurpose) => {
  const maxMegabytes = uploadPurposeConfigs[purpose].maxBytes / mb(1)
  return `${Number.isInteger(maxMegabytes) ? maxMegabytes : maxMegabytes.toFixed(1)} MB`
}

export const getFileExtension = (fileName: string) => {
  const trimmed = fileName.trim().toLowerCase()
  const dotIndex = trimmed.lastIndexOf('.')
  if (dotIndex === -1 || dotIndex === trimmed.length - 1) return ''
  return trimmed.slice(dotIndex + 1)
}

export const sanitizeFileName = (fileName: string, fallback: string) => {
  const trimmed = fileName.trim()
  const safe = (trimmed || fallback).replace(/[^a-zA-Z0-9._-]/g, '_')
  return safe.slice(0, 120) || fallback
}

export const validateUploadMetadata = (input: UploadValidationInput): string | null => {
  const config = getUploadConfig(input.purpose)
  const mimeType = input.mimeType.toLowerCase().split(';')[0]?.trim() ?? ''
  const extension = getFileExtension(input.fileName)

  if (!input.fileName.trim()) return 'A file name is required.'
  if (!Number.isFinite(input.size) || input.size <= 0) return 'The selected file is empty.'
  if (input.size > config.maxBytes) return config.userMessage
  if (!mimeType || !(mimeType in config.allowedMimeTypes)) return config.userMessage
  if (!extension || !config.allowedMimeTypes[mimeType]?.includes(extension)) return config.userMessage

  return null
}
