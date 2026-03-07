"use client"

import { useEffect, useState } from "react"
import VofmunCleanGlobePreview from "@/components/test/vofmun-clean-globe-preview"

type NationalitiesGlobeResponse = {
  counts: Record<string, number>
}

export function NationalitiesVariantC() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchNationalities() {
      try {
        const response = await fetch('/api/nationalities-globe', { cache: 'no-store' })

        if (!response.ok) {
          throw new Error(`Unable to load live nationality data: ${response.status}`)
        }

        const data = (await response.json()) as NationalitiesGlobeResponse

        if (!isMounted) {
          return
        }

        setCounts(data.counts || {})
        setError(null)
      } catch (fetchError) {
        console.error('Failed to load nationalities for Variant C', fetchError)
        if (!isMounted) {
          return
        }

        setError('Live nationality data is currently unavailable.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchNationalities()

    const intervalId = window.setInterval(fetchNationalities, 30_000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  return (
    <div className="rounded-2xl border border-[#B22222]/15 bg-white p-4 shadow-md sm:p-6">
      <h3 className="text-2xl font-bold text-[#B22222] font-serif">Variant C · Live Nationalities Globe</h3>
      <p className="mt-2 text-sm text-gray-600 sm:text-base">
        This globe uses live data from the Supabase <span className="font-semibold">nationalities</span> table.
      </p>

      {isLoading ? <p className="mt-3 text-sm text-gray-500">Loading live nationalities...</p> : null}
      {error ? <p className="mt-3 text-sm text-[#B22222]">{error}</p> : null}

      <div className="mt-5 h-[420px] w-full overflow-hidden rounded-xl border border-black/5 bg-[#020617] sm:h-[520px]">
        <VofmunCleanGlobePreview counts={counts} />
      </div>
    </div>
  )
}
