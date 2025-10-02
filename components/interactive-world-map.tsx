"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"
import { useEffect, useState } from "react"
import { countries } from "@/lib/countries"

interface CountryData {
  country: string
  countryCode: string
  delegates: number
}

const minimumThresholds: Record<string, number> = {
  IN: 44,
  PK: 14,
  PH: 9,
  EG: 5,
  LB: 3,
  JO: 2,
  SY: 2,
  PS: 2,
  IQ: 2,
  IR: 2,
  BD: 2,
  GB: 3,
  US: 1,
  CA: 1,
  DE: 1,
  FR: 1,
  RU: 1,
  CN: 1,
  YE: 1,
  SD: 1,
  LK: 1,
  NP: 1,
  JP: 1,
  KR: 1,
  AE: 1,
}

export function InteractiveWorldMap({ threshold = 70 }: { threshold?: number }) {
  const [participatingCountries, setParticipatingCountries] = useState<CountryData[]>([])
  const [totalDelegates, setTotalDelegates] = useState(0)
  const [totalCountries, setTotalCountries] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDelegateCounts() {
      let dbCounts: Record<string, number> = {}
      
      try {
        const response = await fetch('/api/delegate-counts')
        const data = await response.json()
        dbCounts = data.counts || {}
      } catch (error) {
        console.error('Error fetching delegate counts:', error)
      }
      
      const mergedData: Record<string, number> = {}
      
      Object.keys(minimumThresholds).forEach((countryCode) => {
        const dbCount = dbCounts[countryCode] || 0
        const minCount = minimumThresholds[countryCode]
        mergedData[countryCode] = Math.max(dbCount, minCount)
      })
      
      Object.keys(dbCounts).forEach((countryCode) => {
        if (!mergedData[countryCode]) {
          mergedData[countryCode] = dbCounts[countryCode]
        }
      })
      
      const countryDataArray: CountryData[] = Object.entries(mergedData)
        .map(([countryCode, count]) => {
          const countryInfo = countries.find(c => c.code === countryCode)
          return {
            country: countryInfo?.name || countryCode,
            countryCode: countryCode,
            delegates: count
          }
        })
        .filter(c => c.delegates > 0)
        .sort((a, b) => b.delegates - a.delegates)
      
      const total = countryDataArray.reduce((sum, country) => sum + country.delegates, 0)
      const totalCountriesCount = countryDataArray.length
      
      setParticipatingCountries(countryDataArray)
      setTotalDelegates(total)
      setTotalCountries(totalCountriesCount)
      setIsLoading(false)
    }

    fetchDelegateCounts()
  }, [])

  const showFullList = totalDelegates >= threshold
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
              {isLoading ? '...' : `100+`}
            </div>
            <div className="text-sm text-gray-600">Delegates</div>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 text-lg">Participating Nationalities</h3>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading delegate data...</div>
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
                        <img
                          src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`}
                          alt={`${country.country} flag`}
                          className="w-8 h-6 object-cover rounded-sm border border-gray-200"
                          onError={(e) => {
                            e.currentTarget.src = `https://via.placeholder.com/32x24/cccccc/666666?text=${country.countryCode}`;
                          }}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{country.country}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#B22222] text-white border-0 hover:bg-[#8c2222]">
                        {country.delegates} delegates
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
            Join delegates from around the world in diplomatic discussions that shape our future
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
