import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { ProofOfPaymentForm } from "@/components/proof-of-payment-form"

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
