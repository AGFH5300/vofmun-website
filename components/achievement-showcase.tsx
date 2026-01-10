"use client"

import { useState } from "react"
import { Medal, FileText, Handshake, Star, Lightbulb } from "lucide-react"

export function AchievementShowcase() {
  const [activeCategory, setActiveCategory] = useState("recent")

  const achievements = {
    recent: [
      {
        title: "Outstanding Delegate",
        recipient: "Sarah Chen",
        country: "Singapore",
        committee: "GA1",
        description: "Exceptional leadership in climate change negotiations",
        icon: Medal,
      },
      {
        title: "Best Position Paper",
        recipient: "Marcus Johnson",
        country: "Canada",
        committee: "ECOSOC",
        description: "Comprehensive analysis of sustainable development goals",
        icon: FileText,
      },
      {
        title: "Diplomatic Excellence",
        recipient: "Priya Patel",
        country: "India",
        committee: "WHO",
        description: "Masterful coalition building on global health initiatives",
        icon: Handshake,
      },
    ],
    historical: [
      {
        title: "Secretary-General's Award",
        recipient: "Ahmed Al-Rashid",
        country: "UAE",
        committee: "Security Council",
        description: "Outstanding contribution to peace and security discussions",
        icon: Star,
      },
      {
        title: "Innovation in Diplomacy",
        recipient: "Elena Rodriguez",
        country: "Mexico",
        committee: "UNODC",
        description: "Creative solutions to transnational crime challenges",
        icon: Lightbulb,
      },
    ],
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="bg-gradient-to-r from-[#B22222] to-[#D32F2F] p-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveCategory("recent")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeCategory === "recent" ? "bg-white text-[#B22222]" : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Recent Awards
          </button>
          <button
            onClick={() => setActiveCategory("historical")}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeCategory === "historical" ? "bg-white text-[#B22222]" : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Hall of Fame
          </button>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements[activeCategory as keyof typeof achievements].map((achievement, index) => {
            const IconComponent = achievement.icon
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:scale-105"
              >
                <div className="text-center mb-4">
                  <IconComponent className="w-12 h-12 mx-auto mb-2 text-[#B22222]" />
                  <h3 className="font-bold text-[#B22222] text-lg">{achievement.title}</h3>
                </div>

                <div className="space-y-2 text-center">
                  <div className="font-semibold text-gray-800">{achievement.recipient}</div>
                  <div className="text-sm text-gray-600">Representing {achievement.country}</div>
                  <div className="bg-[#B22222] text-white text-xs px-3 py-1 rounded-full inline-block">
                    {achievement.committee}
                  </div>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">{achievement.description}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-8 text-center">
          <div className="bg-gradient-to-r from-[#B22222] to-[#D32F2F] text-white px-6 py-3 rounded-lg inline-block">
            <div className="font-bold">Join the Legacy</div>
            <div className="text-sm opacity-90">Become the next outstanding delegate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
