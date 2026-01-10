import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Globe, Users, Award } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30">
        <div className="absolute top-0 left-0 w-full h-32 vofmun-gradient transform -skew-y-1 origin-top-left opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-24 lg:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Main Heading */}
          <div className="space-y-3 md:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-balance leading-tight">
              <span className="vofmun-text-gradient">Voices of the Future</span>
              <br />
              <span className="text-foreground">Model United Nations I</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-[#B22222] font-medium tracking-wide">
              Debate • Diplomacy • Difference
            </p>
          </div>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
            Join a youth-driven platform bringing together tomorrow's leaders to debate, collaborate, and create
            solutions for global challenges through diplomatic excellence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
            <Button asChild size="lg" className="vofmun-gradient hover:opacity-90 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto">
              <Link href="/signup" className="flex items-center space-x-2">
                <span>Register Now</span>
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <Link href="/resources">View Resources</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mt-12 sm:mt-16 pt-12 sm:pt-16 border-t border-border px-4 sm:px-0">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">6</div>
                <div className="text-sm text-muted-foreground">Committees</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">250+</div>
                <div className="text-sm text-muted-foreground">Expected Delegates</div>
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-primary/10 rounded-full">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">1st</div>
                <div className="text-sm text-muted-foreground">Annual Conference</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
