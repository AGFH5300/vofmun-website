import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Target, Lightbulb, Heart, ArrowRight } from "lucide-react"

export function AboutSection() {
  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Main About Content */}
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">About VOFMUN</h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto">
              VOFMUN is a youth-driven platform bringing together tomorrow's leaders to debate, collaborate, and create
              solutions for global challenges. Our mission is to foster diplomacy, critical thinking, and global
              awareness among young minds.
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="hover-lift diplomatic-shadow border-0">
              <CardContent className="p-6 text-center space-y-4">
                <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary">Our Mission</h3>
                <p className="text-foreground/70 leading-relaxed">
                  Empowering young leaders to address global challenges through diplomatic dialogue and collaborative
                  problem-solving.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift diplomatic-shadow border-0">
              <CardContent className="p-6 text-center space-y-4">
                <div className="p-3 bg-accent/10 rounded-full w-fit mx-auto">
                  <Lightbulb className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary">Our Vision</h3>
                <p className="text-foreground/70 leading-relaxed">
                  Creating a generation of informed, empathetic leaders who can navigate complex international relations
                  with wisdom.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-lift diplomatic-shadow border-0">
              <CardContent className="p-6 text-center space-y-4">
                <div className="p-3 bg-secondary/10 rounded-full w-fit mx-auto">
                  <Heart className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-primary">Our Values</h3>
                <p className="text-foreground/70 leading-relaxed">
                  Integrity, respect, collaboration, and commitment to making a positive impact on the world through
                  youth engagement.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button asChild size="lg" className="vofmun-gradient hover:opacity-90">
              <Link href="/signup" className="flex items-center space-x-2">
                <span>Join Our Mission</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
