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

  return (
    <div className="min-h-screen">
      <EnhancedNavigation />
      <main className="pt-16">
        <SignupHero />
        <section className="py-16 bg-slate-50">
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
                  <Button asChild variant="outline" className="mt-2">
                    <a href={googleFormPublicUrl} target="_blank" rel="noopener noreferrer" className="text-[#B22222] hover:underline">
                      Open the form 
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>
        <div className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">
              <SignupFormNew />
              <SignupInfo />
            </div>
          </div>
        </div>
        <PaymentDetails />
      </main>
      <Footer />
    </div>
  )
}
