import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { SignupHero } from "@/components/signup-hero"
import { SignupInfo } from "@/components/signup-info"
import { SchoolDelegationForm } from "@/components/school-delegation-form"

export default function SchoolDelegationSignupPage() {
  return (
    <div className="min-h-screen">
      <EnhancedNavigation />
      <main className="pt-16">
        <SignupHero />
        <div className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-[3fr,2fr] gap-12 items-start">
              <SchoolDelegationForm />
              <SignupInfo />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
