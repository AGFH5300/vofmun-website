// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

'use client'

import { FormEvent, useState } from 'react'
import { Loader2, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

      const result = await response.json()

      if (response.status === 404) {
        setServerError(result?.message || "We couldn't find a registered delegate with that email.")
        return
      }

      if (!response.ok && response.status !== 429) {
        throw new Error('Server request failed')
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
