import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import {
  DelegationSpreadsheetBucketError,
  ensureDelegationSpreadsheetBucketExists,
  getDelegationManualBucketSetupChecklist,
  getDelegationSpreadsheetBucketName,
} from '@/utils/supabase/storage'
import { insertSchoolDelegationSchema } from '@/lib/db/schema'
import { z } from 'zod'

export const runtime = 'nodejs'

const spreadsheetSchema = z.object({
  fileName: z.string().min(1, 'Spreadsheet file name is required'),
  mimeType: z.string().min(1, 'Spreadsheet MIME type is required'),
  dataUrl: z
    .string()
    .regex(/^data:.*;base64,.+/, 'Invalid spreadsheet payload received'),
})

const requestSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  schoolAddress: z.string().min(1, 'School address is required'),
  schoolEmail: z.string().email('Enter a valid school email address'),
  schoolCountry: z.string().min(1, 'School country is required'),
  directorName: z.string().min(1, 'Director name is required'),
  directorEmail: z.string().email('Enter a valid director email address'),
  directorPhone: z.string().min(1, 'Director phone number is required'),
  numFaculty: z.coerce.number().int().min(0, 'Number of faculty must be zero or higher'),
  numDelegates: z.coerce.number().int().min(0, 'Number of delegates must be zero or higher'),
  wantsHotels: z.boolean().default(false),
  wantsFlights: z.boolean().default(false),
  wantsAirportTransfers: z.boolean().default(false),
  wantsConferenceTransport: z.boolean().default(false),
  requests: z.string().optional(),
  heardAbout: z.string().optional(),
  termsAccepted: z.boolean().refine((value) => value === true, 'Terms and conditions must be accepted'),
  spreadsheet: spreadsheetSchema,
})

const sanitizeFileName = (fileName: string) => {
  const trimmed = fileName.trim()
  const safeName = trimmed.length > 0 ? trimmed.replace(/[^a-zA-Z0-9._-]/g, '_') : 'delegation'
  const hasExtension = safeName.includes('.')
  return { safeName, hasExtension }
}

const inferSpreadsheetExtension = (mimeType: string) => {
  const normalized = mimeType.toLowerCase().split(';')[0]?.trim() ?? ''

  const knownExtensions: Record<string, string> = {
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.ms-excel.sheet.macroenabled.12': 'xlsm',
    'application/vnd.oasis.opendocument.spreadsheet': 'ods',
    'text/csv': 'csv',
    'application/csv': 'csv',
    'text/tab-separated-values': 'tsv',
    'application/json': 'json',
  }

  if (normalized in knownExtensions) {
    return knownExtensions[normalized]
  }

  const slashIndex = normalized.lastIndexOf('/')
  if (slashIndex !== -1 && slashIndex < normalized.length - 1) {
    return normalized.slice(slashIndex + 1)
  }

  return 'xlsx'
}

let warnedAboutMissingPublicBase = false

const joinUrlParts = (...parts: string[]) => {
  if (parts.length === 0) {
    return ''
  }

  return parts
    .map((part, index) => {
      const trimmed = part.trim()
      if (trimmed.length === 0) {
        return ''
      }

      if (index === 0) {
        return trimmed.replace(/\/+$/, '')
      }

      return trimmed.replace(/^\/+/, '').replace(/\/+$/, '')
    })
    .filter((part) => part.length > 0)
    .join('/')
}

const getStoragePublicBaseUrl = () => {
  const directBaseCandidates = [
    process.env.NEXT_PUBLIC_SUPABASE_STORAGE_PUBLIC_URL,
    process.env.SUPABASE_STORAGE_PUBLIC_URL,
  ]

  const directBase = directBaseCandidates.find((value) => value && value.trim().length > 0)
  if (directBase) {
    return directBase.trim().replace(/\/+$/, '')
  }

  const supabaseUrlCandidates = [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_URL]
  const supabaseUrl = supabaseUrlCandidates.find((value) => value && value.trim().length > 0)
  if (supabaseUrl) {
    return `${supabaseUrl.trim().replace(/\/+$/, '')}/storage/v1/object/public`
  }

  return null
}

// Column spreadsheet_url exists in the database schema, no need to check

export async function POST(request: NextRequest) {
  try {
    const json = await request.json()
    const parsed = requestSchema.parse(json)

    const supabase = await createClient()

    const { spreadsheet, requests, heardAbout, ...rest } = parsed

    const [, base64Data] = spreadsheet.dataUrl.split(',')
    if (!base64Data) {
      throw new Error('Invalid spreadsheet payload received')
    }

    const fileBuffer = Buffer.from(base64Data, 'base64')
    const { safeName, hasExtension } = sanitizeFileName(spreadsheet.fileName)
    const mimeExtension = inferSpreadsheetExtension(spreadsheet.mimeType)
    const fileNameWithExtension = hasExtension ? safeName : `${safeName}.${mimeExtension}`
    const storagePath = `school-delegations/${new Date().toISOString().split('T')[0]}/${randomUUID()}-${fileNameWithExtension}`

    const bucketName = getDelegationSpreadsheetBucketName()
    await ensureDelegationSpreadsheetBucketExists(bucketName)

    const { error: uploadError } = await supabase.storage.from(bucketName).upload(storagePath, fileBuffer, {
      contentType: spreadsheet.mimeType,
      upsert: false,
    })

    if (uploadError) {
      const normalizedMessage = uploadError.message?.toLowerCase() ?? ''
      if (normalizedMessage.includes('not found')) {
        const manualSetupMessage = getDelegationManualBucketSetupChecklist(bucketName)
        throw new DelegationSpreadsheetBucketError(
          `Failed to upload delegation spreadsheet: Supabase storage bucket "${bucketName}" was not found.\n\n${manualSetupMessage}`,
          'Delegation spreadsheet uploads are temporarily unavailable while we finish configuring storage. Please try again later or contact support.'
        )
      }

      throw new Error('Failed to upload delegation spreadsheet: ' + uploadError.message)
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(storagePath)
    let spreadsheetPublicUrl = publicUrlData?.publicUrl ?? null

    // Always ensure we have a properly formatted URL
    if (!spreadsheetPublicUrl || spreadsheetPublicUrl.trim().length === 0) {
      const baseUrl = getStoragePublicBaseUrl()
      if (baseUrl) {
        spreadsheetPublicUrl = joinUrlParts(baseUrl, bucketName, storagePath)
      } else if (!warnedAboutMissingPublicBase) {
        console.warn(
          'Unable to determine Supabase storage public URL base; delegation records will omit spreadsheet_url until configured.'
        )
        warnedAboutMissingPublicBase = true
      }
    }
    
    // Ensure the URL is properly formatted (fallback to constructing it manually)
    if (spreadsheetPublicUrl && !spreadsheetPublicUrl.startsWith('http')) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
      if (supabaseUrl) {
        spreadsheetPublicUrl = `${supabaseUrl.trim().replace(/\/+$/, '')}/storage/v1/object/public/${bucketName}/${storagePath}`
      }
    }

    const normalizedData = insertSchoolDelegationSchema.parse({
      schoolName: rest.schoolName.trim(),
      schoolAddress: rest.schoolAddress.trim(),
      schoolEmail: rest.schoolEmail.trim(),
      schoolCountry: rest.schoolCountry.trim(),
      directorName: rest.directorName.trim(),
      directorEmail: rest.directorEmail.trim(),
      directorPhone: rest.directorPhone.trim(),
      numFaculty: rest.numFaculty,
      numDelegates: rest.numDelegates,
      wantsHotels: rest.wantsHotels,
      wantsFlights: rest.wantsFlights,
      wantsAirportTransfers: rest.wantsAirportTransfers,
      wantsConferenceTransport: rest.wantsConferenceTransport,
      additionalRequests: requests?.trim() ? requests.trim() : null,
      heardAbout: heardAbout?.trim() ? heardAbout.trim() : null,
      termsAccepted: rest.termsAccepted,
      spreadsheetFileName: fileNameWithExtension,
      spreadsheetStoragePath: storagePath,
      spreadsheetMimeType:
        spreadsheet.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      spreadsheetUrl: spreadsheetPublicUrl,
    })

    const insertPayload: Record<string, unknown> = {
      school_name: normalizedData.schoolName,
      school_address: normalizedData.schoolAddress,
      school_email: normalizedData.schoolEmail,
      school_country: normalizedData.schoolCountry,
      director_name: normalizedData.directorName,
      director_email: normalizedData.directorEmail,
      director_phone: normalizedData.directorPhone,
      num_faculty: normalizedData.numFaculty,
      num_delegates: normalizedData.numDelegates,
      wants_hotels: normalizedData.wantsHotels,
      wants_flights: normalizedData.wantsFlights,
      wants_airport_transfers: normalizedData.wantsAirportTransfers,
      wants_conference_transport: normalizedData.wantsConferenceTransport,
      additional_requests: normalizedData.additionalRequests,
      heard_about: normalizedData.heardAbout,
      terms_accepted: normalizedData.termsAccepted,
      spreadsheet_file_name: normalizedData.spreadsheetFileName,
      spreadsheet_storage_path: normalizedData.spreadsheetStoragePath,
      spreadsheet_mime_type: normalizedData.spreadsheetMimeType,
      spreadsheet_url: normalizedData.spreadsheetUrl,
    }

    const { error } = await supabase.from('school_delegations').insert([insertPayload])

    if (error) {
      throw new Error(error.message)
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues.map((issue) => issue.message).join(' ')
      return NextResponse.json(
        {
          status: 'error',
          message: message || 'Please review your submission and try again.',
        },
        { status: 400 }
      )
    }

    if (error instanceof DelegationSpreadsheetBucketError) {
      return NextResponse.json(
        {
          status: 'error',
          message: error.userFacingMessage,
        },
        { status: 503 }
      )
    }

    console.error('School delegation submission error:', error)

    return NextResponse.json(
      {
        status: 'error',
        message: 'Unable to submit the school delegation at this time. Please try again later.',
      },
      { status: 500 }
    )
  }
}

