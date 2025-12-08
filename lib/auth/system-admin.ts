import { createHmac, randomUUID, timingSafeEqual } from "crypto"

export const SYSTEM_ADMIN_AUTH_COOKIE = "system_admin_auth"

export type SystemAdminTokenPayload = {
  role: "admin"
  scope: "system"
  issuedAt: number
  expiresAt: number
  deviceId: string
}

const ENCODING = "base64url"

const getSystemAuthSecret = () => {
  const secret = process.env.SYSTEM_AUTH_SECRET

  if (!secret) {
    throw new Error("SYSTEM_AUTH_SECRET environment variable is not set")
  }

  return secret
}

const encodePayload = (payload: SystemAdminTokenPayload) =>
  Buffer.from(JSON.stringify(payload)).toString(ENCODING)

const signPayload = (payload: SystemAdminTokenPayload) => {
  const secret = getSystemAuthSecret()
  const payloadSegment = encodePayload(payload)
  const signature = createHmac("sha256", secret).update(payloadSegment).digest(ENCODING)

  return `${payloadSegment}.${signature}`
}

export const createSystemAdminToken = (expiresInMs: number) => {
  const issuedAt = Date.now()
  const payload: SystemAdminTokenPayload = {
    role: "admin",
    scope: "system",
    issuedAt,
    expiresAt: issuedAt + expiresInMs,
    deviceId: randomUUID(),
  }

  return signPayload(payload)
}

export const verifySystemAdminToken = (token: string): SystemAdminTokenPayload | null => {
  const secret = getSystemAuthSecret()
  const [payloadSegment, signature] = token.split(".")

  if (!payloadSegment || !signature) return null

  const expectedSignature = createHmac("sha256", secret).update(payloadSegment).digest(ENCODING)
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadSegment, ENCODING).toString("utf8")) as SystemAdminTokenPayload

    if (payload.role !== "admin" || payload.scope !== "system") return null
    if (typeof payload.expiresAt !== "number" || typeof payload.issuedAt !== "number") return null
    if (Date.now() > payload.expiresAt) return null

    return payload
  } catch (error) {
    console.error("Failed to verify system admin token", error)
    return null
  }
}
