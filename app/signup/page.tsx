"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Copy, LinkIcon, } from "lucide-react"

import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { SignupHero } from "@/components/signup-hero"
import { SignupFormNew } from "@/components/signup-form-new"
import { SignupInfo } from "@/components/signup-info"
import { PaymentDetails } from "@/components/payment-details"
import { Button } from "@/components/ui/button"

export default function SignupPage() {
  const googleFormPublicUrl =
    (process.env.NEXT_PUBLIC_GOOGLE_FORM_URL ?? "").trim()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    if (!navigator?.clipboard) {
      return
    }

    try {
      await navigator.clipboard.writeText(googleFormPublicUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy Google Form URL", error)
      setCopied(false)
    }
  }

  return (
    <div className="min-h-screen">
      <EnhancedNavigation />
      <main className="pt-16">
        <section id="overview" className="scroll-mt-28">
          <SignupHero />
        </section>
        <nav
          aria-label="Signup quick links"
          className="sticky top-16 z-30 border-y border-slate-200/70 bg-white/95 backdrop-blur"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm font-semibold text-slate-600">
              <span className="uppercase tracking-wide text-xs text-slate-500">On this page</span>
              <div className="flex flex-wrap gap-3">
                <Link className="hover:text-[#B22222] transition-colors" href="#overview">
                  Overview
                </Link>
                <Link className="hover:text-[#B22222] transition-colors" href="#google-form">
                  Google Form
                </Link>
                <Link className="hover:text-[#B22222] transition-colors" href="#registration">
                  Registration
                </Link>
                <Link className="hover:text-[#B22222] transition-colors" href="#payment">
                  Payment
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <section id="google-form" className="scroll-mt-28 py-16 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="space-y-3 text-center">
                <p className="text-sm font-semibold uppercase tracking-wide text-[#B22222]">
                  Option 1: Google Form Signup
                </p>
                <h2 className="text-2xl sm:text-3xl font-serif text-gray-900">Register with the official Google Form</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Complete the registration form if you prefer Google Forms. Submissions are synced directly into our
                  database.
                </p>
                {googleFormPublicUrl && (
                  <div className="mt-4 flex flex-col items-center gap-4">
                    <Button
                      asChild
                      className="bg-red-700 text-white hover:bg-red-800 px-10 py-5 text-lg font-semibold shadow-lg"
                    >
                      <a
                        href={googleFormPublicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open the form
                      </a>
                    </Button>
                    <div className="flex flex-col sm:flex-row items-center gap-3 rounded-lg bg-white/80 px-4 py-3 text-sm text-gray-600 shadow-sm">
                      <span className="max-w-[28rem] break-all font-medium font-semibold text-[#B22222] underline-offset-4 hover:underline">
                        <LinkIcon className="mr-2 inline-block size-4" />
                        <a href={googleFormPublicUrl} target="_blank" rel="noopener noreferrer">
                          {googleFormPublicUrl}
                        </a>
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-700 hover:bg-red-50"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <span className="flex items-center gap-2">
                            <Check className="size-4" />
                            Copied
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Copy className="size-4" />
                            Copy link
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        <div id="registration" className="scroll-mt-28 py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
              <SignupFormNew />
              <SignupInfo />
            </div>
          </div>
        </div>
        <PaymentDetails id="payment" />
      </main>
      <Footer />
    </div>
  )
}
