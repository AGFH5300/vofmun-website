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

let ensureSpreadsheetUrlColumnPromise: Promise<boolean> | null = null

const ensureSpreadsheetUrlColumn = async (): Promise<boolean> => {
  if (ensureSpreadsheetUrlColumnPromise) {
    return ensureSpreadsheetUrlColumnPromise
  }

  ensureSpreadsheetUrlColumnPromise = (async () => {
    if (!process.env.DATABASE_URL) {
      console.warn(
        'Skipping automatic school_delegations.spreadsheet_url migration because DATABASE_URL is not configured.'
      )
      return false
    }

    try {
      const result = await db.execute(
        sql`select 1 from information_schema.columns where table_schema = 'public' and table_name = 'school_delegations' and column_name = 'spreadsheet_url' limit 1`
      )

      const rows = Array.isArray(result)
        ? result
        : 'rows' in result && Array.isArray(result.rows)
          ? result.rows
          : []

      if (rows.length > 0) {
        return true
      }

      await db.execute(sql`alter table public.school_delegations add column spreadsheet_url text`)
      console.info('Added missing school_delegations.spreadsheet_url column automatically.')
      return true
    } catch (error) {
      console.error('Failed to ensure school_delegations.spreadsheet_url column exists:', error)
      return false
    }
  })()

  return ensureSpreadsheetUrlColumnPromise
}

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
    const mimeExtension = spreadsheet.mimeType.split('/')[1] || 'xlsx'
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
    const spreadsheetPublicUrl = publicUrlData?.publicUrl ?? null

    const hasSpreadsheetUrlColumn = await ensureSpreadsheetUrlColumn()
    if (!hasSpreadsheetUrlColumn) {
      console.warn(
        'school_delegations.spreadsheet_url column is missing; proceeding without storing the spreadsheet public URL.'
      )
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
      additional_requests: normalizedData.additionalRequests,
      heard_about: normalizedData.heardAbout,
      terms_accepted: normalizedData.termsAccepted,
      spreadsheet_file_name: normalizedData.spreadsheetFileName,
      spreadsheet_storage_path: normalizedData.spreadsheetStoragePath,
      spreadsheet_mime_type: normalizedData.spreadsheetMimeType,
    }

    if (hasSpreadsheetUrlColumn) {
      insertPayload.spreadsheet_url = normalizedData.spreadsheetUrl
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

