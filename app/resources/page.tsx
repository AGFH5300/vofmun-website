// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { ResourcesHero } from "@/components/resources-hero"
import { ScheduleSection } from "@/components/schedule-section"
import { CommitteesSection } from "@/components/committees-section"
import { RulesSection } from "@/components/rules-section"
import { ScrollRestoration } from "@/components/scroll-restoration"
import Link from "next/link"

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <EnhancedNavigation />
      <ScrollRestoration />
      <main className="pt-16">
        <section id="overview" className="scroll-mt-28">
          <ResourcesHero />
        </section>
        <nav
          aria-label="Resources quick links"
          className="sticky top-16 z-30 border-y border-slate-200/70 bg-white/95 backdrop-blur"
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm font-semibold text-slate-600">
              <span className="text-xs uppercase tracking-wide text-slate-500">On this page</span>
              <div className="flex flex-wrap gap-3">
                <Link className="transition-colors hover:text-[#B22222]" href="#overview">
                  Overview
                </Link>
                <Link className="transition-colors hover:text-[#B22222]" href="#schedule">
                  Schedule
                </Link>
                <Link className="transition-colors hover:text-[#B22222]" href="#committees">
                  Committees
                </Link>
                <Link className="transition-colors hover:text-[#B22222]" href="#allocation-search">
                  Allocation Search
                </Link>
                <Link className="transition-colors hover:text-[#B22222]" href="#rules">
                  Rules
                </Link>
                <Link className="transition-colors hover:text-[#B22222]" href="#handbooks">
                  Handbooks
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <ScheduleSection />
        <CommitteesSection />
        <RulesSection />
      </main>
      <Footer />
    </div>
  )
}
