import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { ResourcesHero } from "@/components/resources-hero"
import { ScheduleSection } from "@/components/schedule-section"
import { CommitteesSection } from "@/components/committees-section"
import { RulesSection } from "@/components/rules-section"
import { ScrollRestoration } from "@/components/scroll-restoration"

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <EnhancedNavigation />
      <ScrollRestoration />
      <main className="pt-16">
        <ResourcesHero />
        <ScheduleSection />
        <CommitteesSection />
        <RulesSection />
      </main>
      <Footer />
    </div>
  )
}
