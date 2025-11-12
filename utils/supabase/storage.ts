import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const FALLBACK_PAYMENT_PROOF_BUCKET = 'payment-proofs'

let resolvedBucketName: string | null = null
let warnedAboutFallback = false
let warnedAboutMissingServiceRoleKey = false

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
        console.warn(
          'Supabase service role key env var not set; automatic payment proof bucket provisioning is disabled.' +
            ' Set SUPABASE_SERVICE_ROLE_KEY to allow the app to create the bucket automatically or create it manually in the Supabase dashboard.'
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
