const FALLBACK_PAYMENT_PROOF_BUCKET = 'payment-proofs'

let resolvedBucketName: string | null = null
let warnedAboutFallback = false

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

export const getPaymentProofBucketName = () => resolveBucketName()
