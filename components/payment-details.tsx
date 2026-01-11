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

/* SVG ICONS */

function VisaLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="16px" viewBox="0 0 24 16" version="1.1">
        <g id="319" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
            <g id="New-Icons" transform="translate(-80.000000, -280.000000)" fillRule="nonzero">
                <g id="Card-Brands" transform="translate(40.000000, 200.000000)">
                    <g id="Color" transform="translate(0.000000, 80.000000)">
                        <g id="Visa" transform="translate(40.000000, 0.000000)">
                            <rect id="Container" strokeOpacity="0.2" stroke="#000000" strokeWidth="0.5" fill="#FFFFFF" x="0.25" y="0.25" width="23.5" height="15.5" rx="2"/>
                            <path d="M2.78773262,5.91443732 C2.26459089,5.62750595 1.6675389,5.39673777 1,5.23659312 L1.0280005,5.1118821 L3.76497922,5.1118821 C4.13596254,5.12488556 4.43699113,5.23650585 4.53494636,5.63071135 L5.12976697,8.46659052 L5.31198338,9.32072617 L6.97796639,5.1118821 L8.77678896,5.1118821 L6.10288111,11.2775284 L4.30396552,11.2775284 L2.78773262,5.91443732 L2.78773262,5.91443732 Z M10.0999752,11.2840738 L8.39882877,11.2840738 L9.46284763,5.1118821 L11.163901,5.1118821 L10.0999752,11.2840738 Z M16.2667821,5.26277458 L16.0354292,6.59558538 L15.881566,6.53004446 C15.5737466,6.40524617 15.1674138,6.28053516 14.6143808,6.29371316 C13.942741,6.29371316 13.6415263,6.56277129 13.6345494,6.82545859 C13.6345494,7.11441463 13.998928,7.3048411 14.5939153,7.58725177 C15.5740257,8.02718756 16.0286384,8.56556562 16.0218476,9.26818871 C16.0080799,10.5486366 14.8460128,11.376058 13.0610509,11.376058 C12.2978746,11.3694253 11.5627918,11.2180965 11.163808,11.0475679 L11.4018587,9.66204513 L11.6258627,9.76066195 C12.1788958,9.99070971 12.5428092,10.0889775 13.221984,10.0889775 C13.7117601,10.0889775 14.2368857,9.89837643 14.2435835,9.48488392 C14.2435835,9.21565125 14.0198586,9.01850486 13.3617074,8.7164581 C12.717789,8.42086943 11.8568435,7.92848346 11.8707973,7.04197926 C11.8780532,5.84042483 13.0610509,5 14.7409877,5 C15.3990458,5 15.9312413,5.13788902 16.2667821,5.26277458 Z M18.5277524,9.0974856 L19.941731,9.0974856 C19.8717762,8.78889347 19.549631,7.31147374 19.549631,7.31147374 L19.4307452,6.77964104 C19.3467437,7.00942698 19.1998574,7.38373457 19.2069273,7.37055657 C19.2069273,7.37055657 18.6678479,8.74290137 18.5277524,9.0974856 Z M20.6276036,5.1118821 L22,11.2839865 L20.4249023,11.2839865 C20.4249023,11.2839865 20.2707601,10.5748181 20.221922,10.3581228 L18.0377903,10.3581228 C17.9746264,10.5221933 17.6807607,11.2839865 17.6807607,11.2839865 L15.8957988,11.2839865 L18.4226343,5.62399144 C18.5977072,5.22341512 18.9059917,5.1118821 19.3117663,5.1118821 L20.6276036,5.1118821 L20.6276036,5.1118821 Z" id="Shape" fill="#1434CB"/>
                        </g>
                    </g>
                </g>
            </g>
        </g>
    </svg>
  )
}

function MastercardLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 0 24 16" width="24">
      <g fill="none" fillRule="evenodd">
        <rect fill="#252525" height="16" rx="2" width="24"/>
        <circle cx="9" cy="8" fill="#eb001b" r="5"/>
        <circle cx="15" cy="8" fill="#f79e1b" r="5"/>
        <path d="m12 3.99963381c1.2144467.91220633 2 2.36454836 2 4.00036619s-.7855533 3.0881599-2 4.0003662c-1.2144467-.9122063-2-2.36454837-2-4.0003662s.7855533-3.08815986 2-4.00036619z" fill="#ff5f00"/>
      </g>
    </svg>
  )
}

function GooglePayLogo() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="41" height="17"><g fill="none" fillRule="evenodd"><path d="M19.526 2.635v4.083h2.518c.6 0 1.096-.202 1.488-.605.403-.402.605-.882.605-1.437 0-.544-.202-1.018-.605-1.422-.392-.413-.888-.62-1.488-.62h-2.518zm0 5.52v4.736h-1.504V1.198h3.99c1.013 0 1.873.337 2.582 1.012.72.675 1.08 1.497 1.08 2.466 0 .991-.36 1.819-1.08 2.482-.697.665-1.559.996-2.583.996h-2.485v.001zm7.668 2.287c0 .392.166.718.499.98.332.26.722.391 1.168.391.633 0 1.196-.234 1.692-.701.497-.469.744-1.019.744-1.65-.469-.37-1.123-.555-1.962-.555-.61 0-1.12.148-1.528.442-.409.294-.613.657-.613 1.093m1.946-5.815c1.112 0 1.989.297 2.633.89.642.594.964 1.408.964 2.442v4.932h-1.439v-1.11h-.065c-.622.914-1.45 1.372-2.486 1.372-.882 0-1.621-.262-2.215-.784-.594-.523-.891-1.176-.891-1.96 0-.828.313-1.486.94-1.976s1.463-.735 2.51-.735c.892 0 1.629.163 2.206.49v-.344c0-.522-.207-.966-.621-1.33a2.132 2.132 0 0 0-1.455-.547c-.84 0-1.504.353-1.995 1.062l-1.324-.834c.73-1.045 1.81-1.568 3.238-1.568m11.853.262l-5.02 11.53H34.42l1.864-4.034-3.302-7.496h1.635l2.387 5.749h.032l2.322-5.75z" fill="#FFF"/><path d="M13.448 7.134c0-.473-.04-.93-.116-1.366H6.988v2.588h3.634a3.11 3.11 0 0 1-1.344 2.042v1.68h2.169c1.27-1.17 2.001-2.9 2.001-4.944" fill="#4285F4"/><path d="M6.988 13.7c1.816 0 3.344-.595 4.459-1.621l-2.169-1.681c-.603.406-1.38.643-2.29.643-1.754 0-3.244-1.182-3.776-2.774H.978v1.731a6.728 6.728 0 0 0 6.01 3.703" fill="#34A853"/><path d="M3.212 8.267a4.034 4.034 0 0 1 0-2.572V3.964H.978A6.678 6.678 0 0 0 .261 6.98c0 1.085.26 2.11.717 3.017l2.234-1.731z" fill="#FABB05"/><path d="M6.988 2.921c.992 0 1.88.34 2.58 1.008v.001l1.92-1.918C10.324.928 8.804.262 6.989.262a6.728 6.728 0 0 0-6.01 3.702l2.234 1.731c.532-1.592 2.022-2.774 3.776-2.774" fill="#E94235"/></g></svg>
  )
}

export function PaymentDetails() {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null)
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const stripeButtonClasses =
    "inline-flex items-center justify-center gap-2 rounded-lg bg-[#635bff] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#4f47d8] active:bg-[#423ac7] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#635bff]"

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  const handleCopy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiedLabel(label)
      toast.success(`${label} copied`, { duration: 1500 })

      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopiedLabel(null), 2000)
    } catch {
      toast.error("Unable to copy")
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
              <p className="text-sm font-semibold uppercase tracking-widest text-[#B22222]">
                How to Pay
              </p>
              <h2 className="text-2xl font-semibold text-gray-900">
                Secure your VOFMUN seat
              </h2>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-lg border border-[#f4d5d6] overflow-hidden">
            <div className="grid gap-8 p-8 md:grid-cols-2">
              <div>
                {HAS_STRIPE_PAYMENT_LINK && (
                  <div className="mb-6 rounded-xl border border-[#e3ddff] bg-[#f4f2ff] p-4">
                    <p className="text-sm font-semibold text-[#362f78]">
                      Pay instantly with Stripe
                    </p>
                    <p className="text-sm text-[#362f78]">
                      Use Apple Pay, Google Pay, or your credit / debit card.
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-5 leading-none opacity-90
                      [&_svg]:h-7 [&_svg]:w-auto [&_svg]:shrink-0 [&_svg]:block">
                      <VisaLogo />
                      <MastercardLogo />
                      <button
                        aria-label="Apple Pay"
                        type="button"
                        style={{
                          appearance: "-apple-pay-button",
                          WebkitAppearance: "-apple-pay-button",
                          WebkitApplePayButtonStyle: "black",
                          WebkitApplePayButtonType: "buy",
                          height: "28px",
                          width: "42px",
                          display: "inline-block",
                          verticalAlign: "middle",

                          backgroundColor: "#000",
                          borderRadius: "6px",
                          border: "0",
                          padding: "0",
                          color: "#fff",
                          fontSize: "14px",
                          fontWeight: 600,
                          lineHeight: "28px",
                          textAlign: "center",
                        }}
                      >
                        Pay
                      </button>
                      <button
                        aria-label="Google Pay"
                        type="button"
                        style={{
                          height: "28px",
                          width: "42px", 
                          backgroundColor: "#000",
                          borderRadius: "6px",
                          border: "0",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 0,
                            transform: "translateY(6px) translateX(12px) scale(0.88)",
                            transformOrigin: "center",
                          }}
                        >
                          <GooglePayLogo />
                        </span>
                      </button>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <a
                        href={STRIPE_PAYMENT_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${stripeButtonClasses} group w-full sm:w-auto`}
                      >
                        Pay now via Stripe
                        <span className="transition-transform duration-200 group-hover:translate-x-1">➜</span>
                      </a>
                      <span className="text-xs leading-5 text-[#362f78] sm:pt-1">
                        Or use bank transfer below
                      </span>
                    </div>
                  </div>
                )}

                <p className="text-gray-700">{PAYMENT_DETAILS_INTRO}</p>

                <dl className="mt-6 space-y-4">
                  {PAYMENT_DETAILS_ENTRIES.map((entry) => (
                    <div
                      key={entry.label}
                      className="rounded-xl border bg-gray-50 px-4 py-3"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <dt className="text-sm uppercase text-gray-500">
                            {entry.label}
                          </dt>
                          <dd className="font-semibold text-gray-900">
                            {entry.value}
                          </dd>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleCopy(entry.label, entry.value)
                          }
                        >
                          {copiedLabel === entry.label ? (
                            <>
                              <Check className="h-4 w-4 mr-1" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 mr-1" /> Copy
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
