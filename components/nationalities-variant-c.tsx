"use client"

import { useEffect, useState } from "react"
import VofmunCleanGlobe from "@/components/vofmun-clean-globe"
import { getCountryByCode } from "@/lib/countries"

type NationalityRow = {
  code: string
  country: string
  participants: number
}

type NationalitiesGlobeResponse = {
  counts: Record<string, number>
}

export function NationalitiesVariantC() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const rows = Object.entries(counts)
    .map(([code, participants]): NationalityRow => ({
      code,
      country: getCountryByCode(code)?.name ?? code,
      participants,
    }))
    .sort((a, b) => b.participants - a.participants)

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
        console.error('Failed to load nationalities globe data', fetchError)
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
    <div className="rounded-2xl border border-[#B22222]/15 bg-white p-3 shadow-md sm:p-5 lg:p-6">
      <h3 className="text-2xl font-bold text-[#B22222] font-serif">Where Our Delegates Come From</h3>
      <p className="mt-2 text-sm text-gray-600 sm:text-base">
        A live snapshot of the countries shaping this year&apos;s debates, ideas, and diplomacy.
      </p>

      {isLoading ? <p className="mt-3 text-sm text-gray-500">Loading live nationalities...</p> : null}
      {error ? <p className="mt-3 text-sm text-[#B22222]">{error}</p> : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(300px,0.88fr)_minmax(360px,1fr)] lg:items-start lg:gap-4">
        <div className="flex h-[400px] min-h-0 flex-col sm:h-[440px] lg:h-[520px]">
          <h4 className="mb-3 text-lg font-semibold text-gray-900">Participating Nationalities</h4>
          <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
            {rows.map((row) => (
              <div
                key={row.code}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-1.5"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={`https://flagcdn.com/w40/${row.code.toLowerCase()}.png`}
                    alt={`${row.country} flag`}
                    className="h-5 w-8 rounded-sm border border-gray-200 object-cover"
                  />
                  <span className="text-sm font-medium text-gray-800">{row.country}</span>
                </div>
                <span className="rounded-full bg-[#B22222] px-2.5 py-1 text-xs font-semibold text-white">
                  {row.participants} participants
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-[400px] w-full overflow-hidden rounded-xl border border-black/5 bg-[#020617] sm:h-[440px] lg:h-[520px]">
          <VofmunCleanGlobe counts={counts} />
        </div>
      </div>
    </div>
  )
}
