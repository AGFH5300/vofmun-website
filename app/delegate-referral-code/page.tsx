// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import type { Metadata } from "next"
import { DelegateReferralCodeForm } from '@/components/delegate-referral-code-form'
import { EnhancedNavigation } from '@/components/enhanced-navigation'
import { Footer } from '@/components/footer'
import { createPageMetadata } from "@/app/seo-metadata"

export const metadata: Metadata = createPageMetadata({
  title: "Delegate Referral Code | VOFMUN",
  description:
    "Find your VOFMUN delegate referral code to invite peers and track conference referrals.",
  path: "/delegate-referral-code",
})

export default function DelegateReferralCodePage() {
  return (
    <div className="min-h-screen">
      <EnhancedNavigation />
      <main className="pt-16 pb-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl py-12">
            <DelegateReferralCodeForm />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
