import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { SignupHero } from "@/components/signup-hero"
import { SignupFormNew } from "@/components/signup-form-new"
import { SignupInfo } from "@/components/signup-info"
import { PaymentDetails } from "@/components/payment-details"
import { Button } from "@/components/ui/button"

export default function SignupPage() {
  const googleFormEmbedUrl = (process.env.NEXT_PUBLIC_GOOGLE_FORM_EMBED_URL ?? "").trim()
  const googleFormPublicUrl =
    (process.env.NEXT_PUBLIC_GOOGLE_FORM_URL ?? "").trim() ||
    (googleFormEmbedUrl ? googleFormEmbedUrl.replace("embedded=true", "viewform") : "")

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
                  Complete the registration form below if you prefer Google Forms. Submissions are synced directly into our
                  database.
                </p>
                {googleFormPublicUrl && (
                  <Button asChild variant="outline" className="mt-2">
                    <a href={googleFormPublicUrl} target="_blank" rel="noopener noreferrer">
                      Open the form in a new tab
                    </a>
                  </Button>
                )}
              </div>

              {googleFormEmbedUrl ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative w-full pb-[140%] sm:pb-[110%] lg:pb-[90%]">
                    <iframe
                      title="VOFMUN Registration Google Form"
                      src={googleFormEmbedUrl}
                      className="absolute inset-0 h-full w-full"
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  The Google Form link has not been configured yet. Please contact the VOFMUN team for the latest signup
                  link.
                </div>
              )}
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
