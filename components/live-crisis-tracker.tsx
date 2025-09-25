"use client"

import { useState, useEffect } from "react"

export function LiveCrisisTracker() {
  const [currentCrisis, setCurrentCrisis] = useState(0)

  const crises = [
    {
      title: "Climate Emergency Response",
      description: "Delegates must negotiate immediate action on rising sea levels affecting Pacific Island nations.",
      urgency: "High",
      affectedCountries: ["Tuvalu", "Maldives", "Marshall Islands"],
      timeRemaining: "2 hours",
      status: "Active",
    },
    {
      title: "Global Food Security Crisis",
      description: "Addressing supply chain disruptions and ensuring food access for vulnerable populations.",
      urgency: "Critical",
      affectedCountries: ["Yemen", "Afghanistan", "Somalia"],
      timeRemaining: "45 minutes",
      status: "Urgent",
    },
    {
      title: "Cybersecurity Threat Assessment",
      description: "International cooperation needed to address state-sponsored cyber attacks on infrastructure.",
      urgency: "Medium",
      affectedCountries: ["Estonia", "Ukraine", "South Korea"],
      timeRemaining: "3 hours",
      status: "Monitoring",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCrisis((prev) => (prev + 1) % crises.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const crisis = crises[currentCrisis]
  const urgencyColors = {
    High: "bg-orange-500",
    Critical: "bg-red-500",
    Medium: "bg-yellow-500",
  }

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-red-600 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
          <span className="font-bold">LIVE CRISIS SIMULATION</span>
        </div>
        <div className="text-sm opacity-90">Updated every 5 seconds</div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-2xl font-bold">{crisis.title}</h3>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${urgencyColors[crisis.urgency as keyof typeof urgencyColors]}`}
              >
                {crisis.urgency} Priority
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">{crisis.description}</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 text-blue-400">Affected Nations</h4>
                <div className="space-y-1">
                  {crisis.affectedCountries.map((country) => (
                    <div key={country} className="bg-gray-700 px-3 py-1 rounded text-sm">
                      {country}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-green-400">Response Status</h4>
                <div className="bg-gray-700 px-3 py-2 rounded">
                  <div className="flex items-center justify-between">
                    <span>{crisis.status}</span>
                    <span className="text-yellow-400">{crisis.timeRemaining}</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                    <div className="bg-yellow-400 h-2 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-xl p-6">
            <h4 className="font-bold mb-4 text-center">Crisis Navigation</h4>
            <div className="space-y-2">
              {crises.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCrisis(index)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    index === currentCrisis ? "bg-[#B22222] text-white" : "bg-gray-600 hover:bg-gray-500"
                  }`}
                >
                  <div className="font-medium">Crisis {index + 1}</div>
                  <div className="text-sm opacity-75">{crises[index].title}</div>
                </button>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-900 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold">12</div>
                <div className="text-sm">Active Delegates</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
