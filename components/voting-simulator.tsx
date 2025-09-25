"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export function VotingSimulator() {
  const [currentResolution, setCurrentResolution] = useState(0)
  const [votes, setVotes] = useState<{ [key: string]: string }>({})
  const [showResults, setShowResults] = useState(false)

  const resolutions = [
    {
      id: "climate-action",
      title: "Emergency Climate Action Protocol",
      description:
        "Immediate implementation of carbon reduction targets and renewable energy transition funding for developing nations.",
      countries: ["USA", "China", "Germany", "Brazil", "India", "Japan", "UK", "France"],
    },
    {
      id: "digital-rights",
      title: "Global Digital Rights Framework",
      description:
        "Establishing international standards for data privacy, cybersecurity, and digital access as fundamental human rights.",
      countries: ["Estonia", "Singapore", "Canada", "Netherlands", "South Korea", "Sweden", "Switzerland", "Australia"],
    },
  ]

  const resolution = resolutions[currentResolution]

  const handleVote = (country: string, vote: string) => {
    setVotes((prev) => ({ ...prev, [country]: vote }))
  }

  const calculateResults = () => {
    const voteCount = { "In Favor": 0, Against: 0, Abstain: 0 }
    Object.values(votes).forEach((vote) => {
      if (vote in voteCount) {
        voteCount[vote as keyof typeof voteCount]++
      }
    })
    return voteCount
  }

  const results = calculateResults()
  const totalVotes = Object.keys(votes).length

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">UN Voting Simulator</h3>
            <p className="opacity-90">Experience diplomatic decision-making</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">
              Resolution {currentResolution + 1} of {resolutions.length}
            </div>
            <div className="font-bold">
              {totalVotes}/{resolution.countries.length} votes cast
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="mb-8">
          <h4 className="text-xl font-bold text-gray-800 mb-3">{resolution.title}</h4>
          <p className="text-gray-600 leading-relaxed">{resolution.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h5 className="font-bold text-gray-800 mb-4">Cast Your Votes</h5>
            <div className="space-y-3">
              {resolution.countries.map((country) => (
                <div key={country} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">{country}</span>
                  <div className="flex space-x-2">
                    {["In Favor", "Against", "Abstain"].map((voteType) => (
                      <button
                        key={voteType}
                        onClick={() => handleVote(country, voteType)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                          votes[country] === voteType
                            ? voteType === "In Favor"
                              ? "bg-green-500 text-white"
                              : voteType === "Against"
                                ? "bg-red-500 text-white"
                                : "bg-yellow-500 text-white"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        {voteType === "In Favor" ? "✓" : voteType === "Against" ? "✗" : "○"}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h5 className="font-bold text-gray-800">Live Results</h5>
              <Button onClick={() => setShowResults(!showResults)} variant="outline" size="sm">
                {showResults ? "Hide" : "Show"} Results
              </Button>
            </div>

            {showResults && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-800">In Favor</span>
                    <span className="font-bold text-green-800">{results["In Favor"]}</span>
                  </div>
                  <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalVotes > 0 ? (results["In Favor"] / totalVotes) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-800">Against</span>
                    <span className="font-bold text-red-800">{results["Against"]}</span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-red-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalVotes > 0 ? (results["Against"] / totalVotes) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-yellow-800">Abstain</span>
                    <span className="font-bold text-yellow-800">{results["Abstain"]}</span>
                  </div>
                  <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${totalVotes > 0 ? (results["Abstain"] / totalVotes) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {totalVotes === resolution.countries.length && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="font-bold text-blue-800">
                      {results["In Favor"] > results["Against"] ? "Resolution PASSED" : "Resolution FAILED"}
                    </div>
                    <div className="text-sm text-blue-600 mt-1">
                      Required: Simple majority ({Math.ceil(resolution.countries.length / 2)} votes)
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 flex space-x-3">
              <Button
                onClick={() => {
                  setCurrentResolution((prev) => (prev + 1) % resolutions.length)
                  setVotes({})
                  setShowResults(false)
                }}
                className="bg-[#B22222] hover:bg-[#D32F2F]"
              >
                Next Resolution
              </Button>
              <Button
                onClick={() => {
                  setVotes({})
                  setShowResults(false)
                }}
                variant="outline"
              >
                Reset Votes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
