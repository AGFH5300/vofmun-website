import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { SignupHero } from "@/components/signup-hero"
import { SignupFormNew } from "@/components/signup-form-new"
import { SignupInfo } from "@/components/signup-info"
import { PaymentDetails } from "@/components/payment-details"

export default function SignupPage() {
  return (
    <div className="min-h-screen">
      <EnhancedNavigation />
      <main className="pt-16">
        <SignupHero />
        <PaymentDetails />
        <div className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
              <SignupFormNew />
              <SignupInfo />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
