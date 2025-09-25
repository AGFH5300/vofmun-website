"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe } from "lucide-react"

const participatingCountries = [
  { country: "United States", delegates: 15, countryCode: "US" },
  { country: "United Kingdom", delegates: 12, countryCode: "GB" },
  { country: "France", delegates: 10, countryCode: "FR" },
  { country: "Germany", delegates: 8, countryCode: "DE" },
  { country: "Japan", delegates: 14, countryCode: "JP" },
  { country: "Australia", delegates: 6, countryCode: "AU" },
  { country: "Canada", delegates: 9, countryCode: "CA" },
  { country: "Brazil", delegates: 11, countryCode: "BR" },
  { country: "India", delegates: 13, countryCode: "IN" },
  { country: "South Korea", delegates: 7, countryCode: "KR" },
  { country: "Netherlands", delegates: 5, countryCode: "NL" },
  { country: "Sweden", delegates: 4, countryCode: "SE" },
]

export function InteractiveWorldMap() {
  return (
    <Card className="diplomatic-shadow border-0 bg-white/90">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-gray-900">
          <Globe className="h-5 w-5 text-blue-600" />
          <span>Diverse Participation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Global statistics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{participatingCountries.length}</div>
            <div className="text-sm text-gray-600">Countries</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {participatingCountries.reduce((sum, country) => sum + country.delegates, 0)}+
            </div>
            <div className="text-sm text-gray-600">Delegates</div>
          </div>
        </div>

        {/* Participating Countries List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 text-lg">Participating Nationalities</h3>
          <div className="grid gap-3">
            {participatingCountries.map((country, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-8 flex items-center justify-center">
                    <img
                      src={`https://flagcdn.com/w40/${country.countryCode.toLowerCase()}.png`}
                      alt={`${country.country} flag`}
                      className="w-8 h-6 object-cover rounded-sm border border-gray-200"
                      onError={(e) => {
                        // Fallback to a placeholder if flag image fails to load
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