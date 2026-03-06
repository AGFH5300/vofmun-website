import { createClient } from "@/utils/supabase/server"
import { normalizeToAlpha2CountryCode } from "@/lib/countries"
import { PremiumParticipationGlobeShowcase } from "@/components/test/premium-participation-globe-showcase"

export const dynamic = "force-dynamic"

interface ParticipationPayload {
  counts: Record<string, number>
  totalDelegates: number
  totalNationalities: number
  unknownNationalities: number
  lastUpdated: string
}

async function getParticipationPayload(): Promise<ParticipationPayload> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from("users").select("nationality")

    if (error) {
      throw error
    }

    const counts: Record<string, number> = {}
    let unknownNationalities = 0

    for (const user of data ?? []) {
      const normalized = normalizeToAlpha2CountryCode(user.nationality)
      if (!normalized) {
        unknownNationalities += 1
        continue
      }

      counts[normalized] = (counts[normalized] ?? 0) + 1
    }

    const totalDelegates = Object.values(counts).reduce((sum, value) => sum + value, 0)

    return {
      counts,
      totalDelegates,
      totalNationalities: Object.keys(counts).length,
      unknownNationalities,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("Failed to load test premium globe participation data", error)

    return {
      counts: {},
      totalDelegates: 0,
      totalNationalities: 0,
      unknownNationalities: 0,
      lastUpdated: new Date().toISOString(),
    }
  }
}

export default async function PremiumGlobeTestPage() {
  const participation = await getParticipationPayload()

  return (
    <main className="min-h-screen bg-[#030711] text-slate-100">
      <PremiumParticipationGlobeShowcase participation={participation} />
    </main>
  )
}
