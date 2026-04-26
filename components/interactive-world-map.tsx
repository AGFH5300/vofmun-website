// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

"use client"

import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { countries } from "@/lib/countries"
import { isAlpha2CountryCode } from "@/lib/countries"

interface CountryData {
  country: string
  countryCode: string
  participants: number
}

function formatParticipantCountInTens(count: number): string {
  if (count <= 0) {
    return "0+"
  }

  const roundedDownToTens = Math.floor(count / 10) * 10
  const floored = Math.max(10, roundedDownToTens)
  return `${floored}+`
}

function normalizeCountryCode(rawCode: string): string | null {
  const code = rawCode.trim().toUpperCase()

  if (!code) {
    return null
  }

  if (isAlpha2CountryCode(code)) {
    return code
  }

  const byName = countries.find((country) => country.name.toUpperCase() === code)
  return byName?.code || null
}

function createFlagFallbackDataUri(countryCode: string): string {
  const code = countryCode.slice(0, 2).toUpperCase()
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='24'><rect width='40' height='24' fill='#f3f4f6'/><rect x='0.5' y='0.5' width='39' height='23' rx='2' ry='2' fill='none' stroke='#d1d5db'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='Arial,sans-serif' font-size='10' fill='#6b7280'>${code}</text></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function CountryFlag({ countryCode, countryName }: { countryCode: string; countryName: string }) {
  const [imageSrc, setImageSrc] = useState(`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`)

  return (
    <Image
      src={imageSrc}
      alt={`${countryName} flag`}
      width={32}
      height={24}
      loading="eager"
      className="w-8 h-6 object-cover rounded-sm border border-gray-200"
      onError={() => {
        setImageSrc(createFlagFallbackDataUri(countryCode))
      }}
    />
  )
}

export function InteractiveWorldMap({ threshold = 70 }: { threshold?: number }) {
  const [participatingCountries, setParticipatingCountries] = useState<CountryData[]>([])
  const [totalParticipants, setTotalParticipants] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const totalCountries = participatingCountries.length
  const displayedTotalParticipants = useMemo(
    () => formatParticipantCountInTens(totalParticipants),
    [totalParticipants]
  )

  useEffect(() => {
    let isMounted = true

    async function fetchParticipantCounts() {
      let dbCounts: Record<string, number> = {}

      try {
        const response = await fetch('/api/delegate-counts', { cache: "no-store" })

        if (!response.ok) {
          throw new Error(`Failed to fetch participant counts: ${response.status}`)
        }

        const data = await response.json()
        dbCounts = data.counts || {}
      } catch (error) {
        console.error('Error fetching participant counts:', error)
      }

      const mergedData: Record<string, number> = {}

      Object.entries(dbCounts).forEach(([rawCode, count]) => {
        const normalizedCode = normalizeCountryCode(rawCode)

        if (!normalizedCode) {
          return
        }

        mergedData[normalizedCode] = (mergedData[normalizedCode] || 0) + count
      })

      const countryDataArray: CountryData[] = Object.entries(mergedData)
        .map(([countryCode, count]) => {
          const countryInfo = countries.find((c) => c.code === countryCode)
          return {
            country: countryInfo?.name || countryCode,
            countryCode: countryCode,
            participants: count,
          }
        })
        .filter((c) => c.participants > 0)
        .sort((a, b) => b.participants - a.participants)

      const total = countryDataArray.reduce((sum, country) => sum + country.participants, 0)

      if (!isMounted) {
        return
      }

      setParticipatingCountries(countryDataArray)
      setTotalParticipants(total)
      setIsLoading(false)
    }

    fetchParticipantCounts()
    const intervalId = window.setInterval(fetchParticipantCounts, 30_000)

    return () => {
      isMounted = false
      window.clearInterval(intervalId)
    }
  }, [])

  const showFullList = totalParticipants >= threshold
  const displayedCountries = showFullList ? participatingCountries : participatingCountries.slice(0, 5)

  return (
    <Card className="diplomatic-shadow border-0 bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900">
          <Globe className="h-5 w-5 text-blue-600" />
          <span>Diverse Participation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{isLoading ? '...' : totalCountries}</div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {isLoading ? '...' : displayedTotalParticipants}
            </div>
            <div className="text-sm text-gray-600">Participants</div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 text-lg">Participating Nationalities</h3>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading participant data...</div>
          ) : (
            <>
              <div className="grid gap-3">
                {displayedCountries.map((country) => (
                  <div
                    key={country.countryCode}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-8 flex items-center justify-center">
                        <CountryFlag countryCode={country.countryCode} countryName={country.country} />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{country.country}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#B22222] text-white border-0 hover:bg-[#8c2222]">
                        {country.participants} participants
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {!showFullList && participatingCountries.length > 5 && (
                <p className="text-sm text-gray-500 text-center pt-2">
                  ...and {participatingCountries.length - 5} more nationalities
                </p>
              )}
            </>
          )}
        </div>

        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Join participants from around the world in diplomatic discussions that shape our future
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
