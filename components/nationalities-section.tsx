"use client"

import Image from "next/image"
import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"

const VofmunCleanGlobe = dynamic(() => import("@/components/vofmun-clean-globe"), { ssr: false })
import { getCountryByCode } from "@/lib/countries"

type NationalityRow = {
  code: string
  country: string
  participants: number
}

type NationalitiesGlobeResponse = {
  counts: Record<string, number>
}

export function NationalitiesSection() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement | null>(null)

  const rows = Object.entries(counts)
    .map(([code, participants]): NationalityRow => ({
      code,
      country: getCountryByCode(code)?.name ?? code,
      participants,
    }))
    .sort((a, b) => b.participants - a.participants)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      })
    }, { rootMargin: "300px 0px" })

    observer.observe(element)
    return () => observer.disconnect()
  }, [isVisible])

  useEffect(() => {
    let isMounted = true

    async function fetchNationalities() {
      if (document.visibilityState !== 'visible') {
        return
      }

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

    if (!isVisible) {
      return () => {
        isMounted = false
      }
    }

    fetchNationalities()

    const intervalId = window.setInterval(fetchNationalities, 30_000)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchNationalities()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isVisible])

  return (
    <div ref={sectionRef} className="rounded-2xl border border-[#B22222]/15 bg-white p-3 shadow-md sm:p-5 lg:p-6">
      <h3 className="text-2xl font-bold text-[#B22222] font-serif">Where Our Participants Come From</h3>
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
                  <Image
                    src={`https://flagcdn.com/w40/${row.code.toLowerCase()}.png`}
                    alt={`${row.country} flag`}
                    width={32}
                    height={20}
                    loading="lazy"
                    sizes="32px"
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

        <div className="relative h-[400px] w-full overflow-hidden rounded-xl border border-black/5 bg-[#020617] sm:h-[440px] lg:h-[520px]">
          <Badge className="pointer-events-none absolute left-3 top-3 z-10 bg-[#B22222] text-white hover:bg-[#B22222]">
            Beta
          </Badge>
          {isVisible ? <VofmunCleanGlobe counts={counts} /> : <div className="h-full w-full" aria-hidden="true" />}
        </div>
      </div>
    </div>
  )
}
