// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

'use client'

import { FormEvent, useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getRequestErrorMessage, getTooManyRequestsMessage } from '@/lib/http/client-errors'

export function DelegateReferralCodeForm() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setSuccessMessage('')
    setServerError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setEmailError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setEmailError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/delegate-referral-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      if (response.status === 422) {
        setEmailError('Please enter a valid email address')
        return
      }

      const result = await response.json().catch(() => null)

      if (response.status === 404) {
        setServerError(result?.message || "We couldn't find a registered delegate with that email.")
        return
      }

      if (response.status === 429) {
        setServerError(getTooManyRequestsMessage(result?.message))
        return
      }

      if (!response.ok) {
        setServerError(getRequestErrorMessage(response.status, result?.message, 'We could not process your request right now. Please try again in a moment.'))
        return
      }

      setSuccessMessage(result?.message || 'Your referral code has been sent to your email.')
      setEmail('')
    } catch (_error) {
      setServerError('We could not process your request right now. Please try again in a moment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-gray-900">Delegate referral code request</CardTitle>
        <CardDescription className="text-base text-gray-600">
          Enter your registration email to receive your personal delegate referral code.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 space-y-4 rounded-lg border border-[#B22222]/20 bg-[#B22222]/5 p-4">
          <h3 className="text-lg font-semibold text-gray-900">Referral incentive highlights</h3>
          <p className="text-sm leading-relaxed text-gray-700">
            Your referrals directly help us build a stronger, more diverse MUN community. Ambassadors will be featured as trusted representatives of our conference,
            helping promote future editions through their schools, networks, and local communities while strengthening the
            global visibility and impact of VOFMUN.
          </p>
          <ul className="space-y-2 text-sm text-gray-800">
            <li className="rounded-md border border-[#B22222]/30 bg-white px-3 py-2 shadow-sm">
              <span className="inline-block rounded-full bg-[#B22222]/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#8f1b1b]">Referral reward</span>
              <p className="mt-1 font-medium">Every 10 confirmed delegate sign-ups using your code earns you <span className="font-bold">AED 50</span>.</p>
            </li>
            <li className="rounded-md border border-[#B22222]/30 bg-white px-3 py-2 shadow-sm">
              <span className="inline-block rounded-full bg-[#B22222]/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#8f1b1b]">Payout examples</span>
              <p className="mt-1 font-medium">10 delegates = <span className="font-bold">AED 50</span>, 20 delegates = <span className="font-bold">AED 100</span>, 30 delegates = <span className="font-bold">AED 150</span>, and so on.</p>
            </li>
            <li className="rounded-md border border-[#B22222]/30 bg-white px-3 py-2 shadow-sm">
              <span className="inline-block rounded-full bg-[#B22222]/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-[#8f1b1b]">Recognition prize</span>
              <p className="mt-1 font-medium">Top 3 chairs and top 3 delegates receive a certificate and are named <span className="font-bold">VOFMUN Ambassadors</span>.</p>
            </li>
            <li className="rounded-md border border-[#B22222] bg-[#B22222]/10 px-3 py-2 shadow-sm">
              <span className="inline-block rounded-full bg-[#B22222] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">Confirmed</span>
              <p className="mt-1 font-semibold">Top 1 chair and top 1 delegate receive <span className="font-bold">free admission to the UniHawk program</span>.</p>
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="delegate-referral-email" className="text-sm font-medium text-gray-800">
              Email address
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="delegate-referral-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (emailError) {
                    setEmailError('')
                  }
                }}
                className="pl-9"
                disabled={isSubmitting}
              />
            </div>
            {emailError ? <p className="text-sm text-red-600">{emailError}</p> : null}
          </div>

          <Button type="submit" className="w-full bg-[#B22222] text-white hover:bg-[#8f1b1b]" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending referral code...
              </span>
            ) : (
              'Send my referral code'
            )}
          </Button>

          {successMessage ? (
            <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{successMessage}</p>
          ) : null}

          {serverError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}
