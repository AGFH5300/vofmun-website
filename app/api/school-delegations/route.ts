// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/utils/supabase/server'
import { db } from '@/lib/db'
import { sql } from 'drizzle-orm'
import {
  DelegationSpreadsheetBucketError,
  getDelegationSpreadsheetBucketName,
} from '@/utils/supabase/storage'
import { insertSchoolDelegationSchema } from '@/lib/db/schema'
import { normalizeToAlpha2CountryCode } from '@/lib/countries'
import { z } from 'zod'
import { verifyUploadReference } from '@/lib/uploads/intent'
import { rejectLargeJsonRequest } from '@/lib/http/request-size'

export const runtime = 'nodejs'

const spreadsheetSchema = z.object({
  uploadReference: z.unknown(),
}).strict()

const requestSchema = z.object({
  schoolName: z.string().min(1, 'School name is required'),
  schoolAddress: z.string().min(1, 'School address is required'),
  schoolEmail: z.string().email('Enter a valid school email address'),
  schoolCountry: z
    .string()
    .min(1, 'School country is required')
    .refine((value) => normalizeToAlpha2CountryCode(value) !== null, 'School country must be a valid 2-letter ISO code')
    .transform((value) => normalizeToAlpha2CountryCode(value) as string),
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
  const tooLarge = rejectLargeJsonRequest(request, 128 * 1024)
  if (tooLarge) return tooLarge

  let uploadedStoragePath: string | null = null
  try {
    const json = await request.json()
    const parsed = requestSchema.parse(json)

    const supabase = await createClient()

    const { spreadsheet, requests, heardAbout, ...rest } = parsed

    const bucketName = getDelegationSpreadsheetBucketName()
    const uploadReference = verifyUploadReference(spreadsheet.uploadReference, 'school-delegation-spreadsheet', bucketName)
    if (uploadReference.bucket !== bucketName) {
      throw new Error('Delegation spreadsheet upload bucket is not configured for this deployment.')
    }
    const pathParts = uploadReference.path.split('/')
    const fileName = pathParts.pop()
    const { data: objects, error: objectLookupError } = await supabase.storage
      .from(bucketName)
      .list(pathParts.join('/'), { search: fileName, limit: 1 })
    if (objectLookupError) throw new Error('Failed to verify delegation spreadsheet upload: ' + objectLookupError.message)
    if (!fileName || !objects?.some((object) => object.name === fileName)) {
      throw new Error('Delegation spreadsheet upload was not found. Please upload the file again.')
    }

    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(uploadReference.path)
    uploadedStoragePath = uploadReference.path
    let spreadsheetPublicUrl = publicUrlData?.publicUrl ?? null

    // Always ensure we have a properly formatted URL
    if (!spreadsheetPublicUrl || spreadsheetPublicUrl.trim().length === 0) {
      const baseUrl = getStoragePublicBaseUrl()
      if (baseUrl) {
        spreadsheetPublicUrl = joinUrlParts(baseUrl, bucketName, uploadReference.path)
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
        spreadsheetPublicUrl = `${supabaseUrl.trim().replace(/\/+$/, '')}/storage/v1/object/public/${bucketName}/${uploadReference.path}`
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
      spreadsheetFileName: uploadReference.fileName,
      spreadsheetStoragePath: uploadReference.path,
      spreadsheetMimeType: uploadReference.mimeType,
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
      if (uploadedStoragePath) {
        await supabase.storage.from(bucketName).remove([uploadedStoragePath]).catch((removeError) => {
          console.error('Failed to remove unrecorded delegation spreadsheet:', removeError instanceof Error ? removeError.message : 'Unknown error')
        })
      }
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
