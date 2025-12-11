"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ShieldCheck, UploadCloud, Wallet, Copy, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import {
  HAS_STRIPE_PAYMENT_LINK,
  PAYMENT_DETAILS_ENTRIES,
  PAYMENT_DETAILS_INTRO,
  PAYMENT_DETAILS,
  STRIPE_PAYMENT_URL,
} from "@/lib/payment-details"

export function PaymentDetails() {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const stripeButtonClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#4f47d8] active:bg-[#423ac7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedLabel(label)
      toast.success(`${label} copied`, {
        description: value,
        duration: 1500,
      })

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopiedLabel(null)
      }, 2000)
    } catch (error) {
      console.error("Failed to copy payment detail", error)
      toast.error("Unable to copy", {
        description: "Please copy the details manually.",
      })
    }
  }

  return (
    <section className="bg-[#fff8f7] border-y border-[#f7c6c7]/60">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-11 w-11 rounded-full bg-[#B22222]/10 text-[#B22222] flex items-center justify-center">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#B22222]">How to Pay</p>
              <h2 className="text-2xl font-semibold text-gray-900">Secure your VOFMUN seat</h2>
            </div>
          </div>
          <div className="rounded-2xl bg-white shadow-lg shadow-[#b22222]/5 border border-[#f4d5d6] overflow-hidden">
            <div className="grid gap-8 p-8 md:grid-cols-2">
              <div>
                {HAS_STRIPE_PAYMENT_LINK && (
                  <div className="mb-6 rounded-xl border border-[#e3ddff] bg-[#f4f2ff] p-4">
                    <p className="text-sm font-semibold text-[#362f78]">Pay instantly with Stripe</p>
                    <p className="text-sm text-[#362f78]">
                      Use debit/credit cards or local payment methods with our secure Stripe checkout.
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <a
                        href={STRIPE_PAYMENT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${stripeButtonClasses} group w-full sm:w-auto`}
                        style={{ fontFamily: '"Helvetica Neue", Arial, sans-serif' }}
                      >
                        Pay now via Stripe
                        <span className="transition-transform duration-200 group-hover:translate-x-1">➜</span>
                      </a>
                      <span className="text-xs text-[#362f78]">Or use the bank transfer details below.</span>
                    </div>
                  </div>
                )}
                <p className="text-gray-700 leading-relaxed">{PAYMENT_DETAILS_INTRO}</p>
                <dl className="mt-6 space-y-4">
                  {PAYMENT_DETAILS_ENTRIES.map((entry) => (
                    <div
                      key={entry.label}
                      className="rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 flex flex-col gap-2"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <dt className="text-sm uppercase tracking-wide text-gray-500">{entry.label}</dt>
                          <dd className="text-base font-semibold text-gray-900 break-words">{entry.value}</dd>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-1 text-xs"
                          onClick={() => handleCopy(entry.label, entry.value)}
                        >
                          {copiedLabel === entry.label ? (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="space-y-5">
                <div className="rounded-2xl bg-[#B22222] text-white p-6">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-6 w-6 flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold">Payment reference</h3>
                      <p className="text-sm text-white/90 leading-relaxed">
                        Include your full name with the reference "{PAYMENT_DETAILS.paymentReference}" so we can match your bank transfer quickly.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl border border-dashed border-[#B22222]/40 bg-white/80 p-6">
                  <div className="flex items-start gap-3">
                    <UploadCloud className="h-6 w-6 text-[#B22222] flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Upload proof after paying</h3>
                      <p className="text-gray-600 leading-relaxed">{PAYMENT_DETAILS.proofInstructions}</p>
                      <Link
                        href="/proof-of-payment"
                        className="mt-4 inline-flex items-center text-[#B22222] font-semibold hover:underline"
                      >
                        Go to the Payment Proof upload page →
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Need help with payments? Email us anytime at {" "}
                  <a href="mailto:conference@vofmun.org" className="font-semibold text-[#B22222] hover:underline">
                    conference@vofmun.org
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
