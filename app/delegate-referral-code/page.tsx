// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { DelegateReferralCodeForm } from '@/components/delegate-referral-code-form'
import { EnhancedNavigation } from '@/components/enhanced-navigation'
import { Footer } from '@/components/footer'

export default function DelegateReferralCodePage() {
  return (
    <div className="min-h-screen bg-slate-50">
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
