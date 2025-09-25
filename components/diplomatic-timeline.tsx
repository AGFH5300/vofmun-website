"use client"

import { FileText, BookOpen, Users, Building, Zap, Vote, Trophy } from "lucide-react"

export function DiplomaticTimeline() {
  const timelineSteps = [
    {
      step: 1,
      title: "Registration & Country Assignment",
      description: "Secure your spot and receive your country delegation",
      icon: FileText,
      status: "upcoming",
    },
    {
      step: 2,
      title: "Research & Preparation",
      description: "Study your country's positions and committee topics",
      icon: BookOpen,
      status: "upcoming",
    },
    {
      step: 3,
      title: "Opening Ceremonies",
      description: "Welcome address and committee introductions",
      icon: Users,
      status: "upcoming",
    },
    {
      step: 4,
      title: "Committee Sessions",
      description: "Engage in debates and draft working papers",
      icon: Building,
      status: "upcoming",
    },
    {
      step: 5,
      title: "Crisis Simulations",
      description: "Respond to real-time global challenges",
      icon: Zap,
      status: "upcoming",
    },
    {
      step: 6,
      title: "Resolution Voting",
      description: "Vote on final resolutions and agreements",
      icon: Vote,
      status: "upcoming",
    },
    {
      step: 7,
      title: "Closing & Awards",
      description: "Celebrate achievements and diplomatic excellence",
      icon: Trophy,
      status: "upcoming",
    },
  ]

  return (
    <div className="relative">
      <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-[#B22222] to-gray-300 h-full"></div>

      <div className="space-y-12">
        {timelineSteps.map((step, index) => {
          const IconComponent = step.icon
          return (
            <div key={step.step} className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
              <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                <div
                  className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-all hover:shadow-xl ${
                    step.status === "completed"
                      ? "border-green-500 bg-green-50"
                      : step.status === "current"
                        ? "border-[#B22222] bg-red-50"
                        : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <IconComponent className="w-6 h-6 text-[#B22222]" />
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{step.title}</h3>
                      <div
                        className={`text-xs px-2 py-1 rounded-full inline-block ${
                          step.status === "completed"
                            ? "bg-green-500 text-white"
                            : step.status === "current"
                              ? "bg-[#B22222] text-white"
                              : "bg-gray-300 text-gray-700"
                        }`}
                      >
                        {step.status === "completed"
                          ? "Completed"
                          : step.status === "current"
                            ? "In Progress"
                            : "Upcoming"}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>

              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-bold text-white ${
                    step.status === "completed"
                      ? "bg-green-500 border-green-300"
                      : step.status === "current"
                        ? "bg-[#B22222] border-red-300 animate-pulse"
                        : "bg-gray-400 border-gray-300"
                  }`}
                >
                  {step.step}
                </div>
              </div>

              <div className="w-1/2"></div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
