// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { NextResponse, type NextRequest } from 'next/server'

export const rejectLargeJsonRequest = (request: NextRequest, maxBytes: number) => {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) return null
  const parsed = Number(contentLength)
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > maxBytes) {
    return NextResponse.json({ status: 'error', message: 'Request body is too large.' }, { status: 413 })
  }
  return null
}
