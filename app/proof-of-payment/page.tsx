// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import type { Metadata } from "next"
import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { ProofOfPaymentForm } from "@/components/proof-of-payment-form"
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Proof of Payment | VOFMUN",
  description:
    "Upload your VOFMUN payment proof so the team can verify your registration and complete your delegate onboarding.",
  path: "/proof-of-payment",
})

export default function ProofOfPaymentPage() {
  return (
    <div className="min-h-screen bg-[#ffecdd]">
      <EnhancedNavigation />
      <main className="pt-16 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto py-12">
            <ProofOfPaymentForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
