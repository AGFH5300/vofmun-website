const FALLBACK_PAYMENT_PROOF_BUCKET = 'payment-proofs'

const resolveBucketName = () => {
  const fromPublicEnv = process.env.NEXT_PUBLIC_SUPABASE_PAYMENT_PROOFS_BUCKET?.trim()
  if (fromPublicEnv) {
    return fromPublicEnv
  }

  const fromServerEnv = process.env.SUPABASE_PAYMENT_PROOFS_BUCKET?.trim()
  if (fromServerEnv) {
    return fromServerEnv
  }

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'Supabase payment proof bucket env var not set; falling back to default bucket "payment-proofs".'
    )
  }

  return FALLBACK_PAYMENT_PROOF_BUCKET
}

export const getPaymentProofBucketName = () => resolveBucketName()
