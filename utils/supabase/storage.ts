import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const FALLBACK_PAYMENT_PROOF_BUCKET = 'payment-proofs'
const FALLBACK_DELEGATION_SPREADSHEET_BUCKET = 'school-delegation-spreadsheets'

let resolvedBucketName: string | null = null
let warnedAboutFallback = false
let warnedAboutMissingServiceRoleKey = false
let resolvedDelegationBucketName: string | null = null
let warnedAboutDelegationFallback = false
let warnedAboutDelegationMissingServiceRoleKey = false

const ensuredBuckets = new Set<string>()
const ensuringBuckets = new Map<string, Promise<void>>()

const resolveBucketName = () => {
  if (resolvedBucketName) {
    return resolvedBucketName
  }

  const candidateEnvVars = [
    process.env.NEXT_PUBLIC_SUPABASE_PAYMENT_PROOFS_BUCKET,
    process.env.NEXT_PUBLIC_SUPABASE_PAYMENT_PROOF_BUCKET,
    process.env.SUPABASE_PAYMENT_PROOFS_BUCKET,
    process.env.SUPABASE_PAYMENT_PROOF_BUCKET,
    process.env.SUPABASE_STORAGE_PAYMENT_PROOFS_BUCKET,
    process.env.SUPABASE_STORAGE_PAYMENT_PROOF_BUCKET,
  ]

  const matchingEnvVar = candidateEnvVars.find((value) => value && value.trim().length > 0)

  if (matchingEnvVar) {
    resolvedBucketName = matchingEnvVar.trim()
    return resolvedBucketName
  }

  if (!warnedAboutFallback && process.env.NODE_ENV !== 'production') {
    console.warn(
      'Supabase payment proof bucket env var not set; falling back to default bucket "payment-proofs".'
    )
    warnedAboutFallback = true
  }

  resolvedBucketName = FALLBACK_PAYMENT_PROOF_BUCKET
  return resolvedBucketName
}

const getServiceRoleKey = () =>
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE

const buildManualBucketSetupChecklist = (bucketName: string) =>
  [
    `Payment proof storage bucket "${bucketName}" is missing. To finish configuring uploads:`,
    '1. Sign in to your Supabase dashboard and open the project linked to this site.',
    '2. Navigate to **Storage → Buckets**.',
    `3. Create a new bucket named **${bucketName}** and set its access to **Public**.`,
    '4. (Optional) Add SUPABASE_PAYMENT_PROOF_BUCKET or SUPABASE_PAYMENT_PROOFS_BUCKET to your environment so future deploys reuse this bucket.',
    '5. (Optional) Add SUPABASE_SERVICE_ROLE_KEY to allow the app to auto-provision the bucket next time.',
    '   See docs/payment-proof-setup.md for the complete checklist.',
  ].join('\n')

export const getManualBucketSetupChecklist = (bucketName: string) =>
  buildManualBucketSetupChecklist(bucketName)

const resolveDelegationBucketName = () => {
  if (resolvedDelegationBucketName) {
    return resolvedDelegationBucketName
  }

  const candidateEnvVars = [
    process.env.NEXT_PUBLIC_SUPABASE_SCHOOL_DELEGATION_SPREADSHEETS_BUCKET,
    process.env.NEXT_PUBLIC_SUPABASE_SCHOOL_DELEGATIONS_BUCKET,
    process.env.SUPABASE_DELEGATION_SPREADSHEETS_BUCKET,
    process.env.SUPABASE_SCHOOL_DELEGATIONS_BUCKET,
    process.env.SUPABASE_STORAGE_DELEGATION_SPREADSHEETS_BUCKET,
    process.env.SUPABASE_STORAGE_SCHOOL_DELEGATIONS_BUCKET,
  ]

  const matchingEnvVar = candidateEnvVars.find((value) => value && value.trim().length > 0)

  if (matchingEnvVar) {
    resolvedDelegationBucketName = matchingEnvVar.trim()
    return resolvedDelegationBucketName
  }

  if (!warnedAboutDelegationFallback && process.env.NODE_ENV !== 'production') {
    console.warn(
      'Supabase delegation spreadsheet bucket env var not set; falling back to default bucket "school-delegation-spreadsheets".'
    )
    warnedAboutDelegationFallback = true
  }

  resolvedDelegationBucketName = FALLBACK_DELEGATION_SPREADSHEET_BUCKET
  return resolvedDelegationBucketName
}

const buildDelegationManualBucketSetupChecklist = (bucketName: string) =>
  [
    `Delegation spreadsheet storage bucket "${bucketName}" is missing. To finish configuring uploads:`,
    '1. Sign in to your Supabase dashboard and open the project linked to this site.',
    '2. Navigate to **Storage → Buckets**.',
    `3. Create a new bucket named **${bucketName}** and set its access to **Public**.`,
    '4. (Optional) Add SUPABASE_DELEGATION_SPREADSHEETS_BUCKET or SUPABASE_SCHOOL_DELEGATIONS_BUCKET to your environment so future deploys reuse this bucket.',
    '5. (Optional) Add SUPABASE_SERVICE_ROLE_KEY to allow the app to auto-provision the bucket next time.',
  ].join('\n')

export const getDelegationManualBucketSetupChecklist = (bucketName: string) =>
  buildDelegationManualBucketSetupChecklist(bucketName)

const isNotFoundError = (errorMessage: string | undefined | null) => {
  if (!errorMessage) {
    return false
  }

  const normalized = errorMessage.toLowerCase()
  return normalized.includes('not found') || normalized.includes('does not exist')
}

export class PaymentProofBucketError extends Error {
  constructor(
    message: string,
    public readonly userFacingMessage =
      'Payment proof storage is temporarily unavailable. Please contact the site administrator.'
  ) {
    super(message)
    this.name = 'PaymentProofBucketError'
  }
}

export class DelegationSpreadsheetBucketError extends Error {
  constructor(
    message: string,
    public readonly userFacingMessage =
      'Delegation spreadsheet uploads are temporarily unavailable. Please contact the site administrator.'
  ) {
    super(message)
    this.name = 'DelegationSpreadsheetBucketError'
  }
}

export const ensurePaymentProofBucketExists = async (bucketName: string) => {
  if (ensuredBuckets.has(bucketName)) {
    return
  }

  const existingPromise = ensuringBuckets.get(bucketName)
  if (existingPromise) {
    return existingPromise
  }

  const ensurePromise = (async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      throw new PaymentProofBucketError(
        'Supabase URL environment variable NEXT_PUBLIC_SUPABASE_URL is not configured.',
        'Payment proof storage is not configured. Please contact the site administrator.'
      )
    }

    const serviceRoleKey = getServiceRoleKey()

    if (!serviceRoleKey) {
      if (!warnedAboutMissingServiceRoleKey && process.env.NODE_ENV !== 'production') {
        const manualSetupMessage = buildManualBucketSetupChecklist(bucketName)
        console.warn(
          'Supabase service role key env var not set; automatic payment proof bucket provisioning is disabled.\n' +
            manualSetupMessage
        )
        warnedAboutMissingServiceRoleKey = true
      }

      return
    }

    const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey)

    const { data: bucketData, error: bucketLookupError } = await adminClient.storage.getBucket(bucketName)

    if (bucketLookupError && !isNotFoundError(bucketLookupError.message)) {
      throw new PaymentProofBucketError(
        `Failed to verify Supabase storage bucket "${bucketName}": ${bucketLookupError.message}`
      )
    }

    if (bucketData) {
      ensuredBuckets.add(bucketName)
      return
    }

    const { error: bucketCreationError } = await adminClient.storage.createBucket(bucketName, {
      public: true,
    })

    if (bucketCreationError) {
      throw new PaymentProofBucketError(
        `Failed to automatically create Supabase storage bucket "${bucketName}": ${bucketCreationError.message}.`,
        'Payment proof storage is not configured. Please contact the site administrator.'
      )
    }

    ensuredBuckets.add(bucketName)
  })()

  ensuringBuckets.set(bucketName, ensurePromise)

  try {
    await ensurePromise
  } finally {
    ensuringBuckets.delete(bucketName)
  }
}

export const getPaymentProofBucketName = () => resolveBucketName()

export const ensureDelegationSpreadsheetBucketExists = async (bucketName: string) => {
  if (ensuredBuckets.has(bucketName)) {
    return
  }

  const existingPromise = ensuringBuckets.get(bucketName)
  if (existingPromise) {
    return existingPromise
  }

  const ensurePromise = (async () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL

    if (!supabaseUrl) {
      throw new DelegationSpreadsheetBucketError(
        'Supabase URL environment variable NEXT_PUBLIC_SUPABASE_URL is not configured.',
        'Delegation spreadsheet storage is not configured. Please contact the site administrator.'
      )
    }

    const serviceRoleKey = getServiceRoleKey()

    if (!serviceRoleKey) {
      if (!warnedAboutDelegationMissingServiceRoleKey && process.env.NODE_ENV !== 'production') {
        const manualSetupMessage = buildDelegationManualBucketSetupChecklist(bucketName)
        console.warn(
          'Supabase service role key env var not set; automatic delegation spreadsheet bucket provisioning is disabled.\n' +
            manualSetupMessage
        )
        warnedAboutDelegationMissingServiceRoleKey = true
      }

      return
    }

    const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey)

    const { data: bucketData, error: bucketLookupError } = await adminClient.storage.getBucket(bucketName)

    if (bucketLookupError && !isNotFoundError(bucketLookupError.message)) {
      throw new DelegationSpreadsheetBucketError(
        `Failed to verify Supabase storage bucket "${bucketName}": ${bucketLookupError.message}`
      )
    }

    if (bucketData) {
      ensuredBuckets.add(bucketName)
      return
    }

    const { error: bucketCreationError } = await adminClient.storage.createBucket(bucketName, {
      public: true,
    })

    if (bucketCreationError) {
      throw new DelegationSpreadsheetBucketError(
        `Failed to automatically create Supabase storage bucket "${bucketName}": ${bucketCreationError.message}.`,
        'Delegation spreadsheet storage is not configured. Please contact the site administrator.'
      )
    }

    ensuredBuckets.add(bucketName)
  })()

  ensuringBuckets.set(bucketName, ensurePromise)

  try {
    await ensurePromise
  } finally {
    ensuringBuckets.delete(bucketName)
  }
}

export const getDelegationSpreadsheetBucketName = () => resolveDelegationBucketName()
