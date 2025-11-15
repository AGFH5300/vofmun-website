
"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight, Upload, Users, AlertTriangle, Award, Send, MessageSquare, FileText, Clock, User, CheckCircle, Star, Globe } from "lucide-react"

const features = [
  {
    icon: Upload,
    title: "Resolution & Amendment Submission",
    description: "Submit and track all resolutions and amendments through our secure platform with real-time status updates",
    color: "bg-blue-500",
    mockup: "resolution"
  },
  {
    icon: Users,
    title: "Networking & Messaging",
    description: "Connect with fellow delegates, chairs, and admin staff before and during the conference through our safely moderated instant messaging platform",
    color: "bg-green-500",
    mockup: "networking"
  },
  {
    icon: AlertTriangle,
    title: "Live Crisis Updates",
    description: "Real-time crisis updates for all committees challenge delegates with dynamic diplomatic situations and an urgent need for response",
    color: "bg-red-500",
    mockup: "crisis"
  },
  {
    icon: Award,
    title: "Achievement Tracking",
    description: "Earn recognition for outstanding achievements, track your progress, and showcase leadership throughout the conference",
    color: "bg-purple-500",
    mockup: "achievements"
  },
]

const ResolutionMockup = () => (
  <div className="bg-gray-50 rounded-lg p-4 mt-4 border">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-sm">Draft Resolution GA1 -  Bloc 1</h4>
      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">Under Review</span>
    </div>
    <div className="text-xs text-gray-600 mb-3"> Topic: Climate Change Mitigation Strategies</div>
    <div className="text-xs text-gray-600 mb-3"> Main Submitter: Germany</div>
    <div className="flex space-x-2 mb-3">
      <button className="bg-blue-500 text-white px-3 py-1 rounded text-xs flex items-center space-x-1">
        <Upload className="w-3 h-3" />
        <span>Upload Amendment</span>
      </button>
      <button className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs">Track Status</button>
    </div>
    <div className="bg-white rounded p-2 text-xs">
      <div className="flex items-center space-x-2 mb-1">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Submitted: Feb 14 2026, 09:45</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
        <span>Being Debated</span>
      </div>
    </div>
  </div>
)

const NetworkingMockup = () => (
  <div className="bg-gray-50 rounded-lg p-4 mt-4 border">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-sm">Delegate Network</h4>
      <div className="flex items-center space-x-1">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs text-green-600">24 Online</span>
      </div>
    </div>
    <div className="space-y-2 mb-3">
      <div className="flex items-center space-x-2 bg-white rounded p-2">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium">Sarah Chen (Singapore)</div>
          <div className="text-xs text-gray-500">General Assembly 1</div>
        </div>
        <MessageSquare className="w-4 h-4 text-gray-400" />
      </div>
      <div className="flex items-center space-x-2 bg-white rounded p-2">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <User className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-medium">Ahmed Al-Rashid (UAE)</div>
          <div className="text-xs text-gray-500">Security Council</div>
        </div>
        <MessageSquare className="w-4 h-4 text-gray-400" />
      </div>
    </div>
    <div className="bg-white rounded p-2">
      <div className="flex items-center space-x-2">
        <input className="flex-1 text-xs border rounded px-2 py-1" placeholder="Send a message..." />
        <Send className="w-4 h-4 text-blue-500" />
      </div>
      <div className="text-xs text-gray-500 mt-1">All messages are moderated for safety</div>
    </div>
  </div>
)

const CrisisMockup = () => (
  <div className="bg-gray-900 text-white rounded-lg p-4 mt-4 border">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <h4 className="font-semibold text-sm text-red-400">CRISIS ALERT</h4>
      </div>
      <div className="text-xs text-gray-400">2 min ago</div>
    </div>
    <div className="text-sm font-medium mb-2">Climate Emergency Response</div>
    <div className="text-xs text-gray-300 mb-3">
      Rising sea levels threaten Pacific Island nations. Immediate diplomatic action required.
    </div>
    <div className="grid grid-cols-2 gap-2 mb-3">
      <div className="bg-gray-800 rounded p-2">
        <div className="text-xs text-red-400">Urgency</div>
        <div className="text-sm font-bold">Critical</div>
      </div>
      <div className="bg-gray-800 rounded p-2">
        <div className="text-xs text-yellow-400">Time Left</div>
        <div className="text-sm font-bold">45 min</div>
      </div>
    </div>
    <div className="flex space-x-2">
      <button className="bg-red-600 text-white px-3 py-1 rounded text-xs">Respond</button>
      <button className="bg-gray-700 text-gray-300 px-3 py-1 rounded text-xs">View Details</button>
    </div>
  </div>
)

const AchievementsMockup = () => (
  <div className="bg-gray-50 rounded-lg p-4 mt-4 border">
    <div className="flex items-center justify-between mb-3">
      <h4 className="font-semibold text-sm">Your Progress</h4>
      <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">Level 3</div>
    </div>
    <div className="space-y-2 mb-3">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-xs">First Resolution Submitted</span>
        <span className="text-xs text-gray-500">+50 XP</span>
      </div>
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-xs">Crisis Response Leader</span>
        <span className="text-xs text-gray-500">+100 XP</span>
      </div>
      <div className="flex items-center space-x-2 opacity-50">
        <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
        <span className="text-xs">Outstanding Delegate</span>
        <span className="text-xs text-gray-400">0/200 XP</span>
      </div>
    </div>
    <div className="bg-white rounded p-2">
      <div className="flex justify-between text-xs mb-1">
        <span>Progress to Level 4</span>
        <span>150/300 XP</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div className="bg-purple-500 h-2 rounded-full w-1/2"></div>
      </div>
    </div>
    <div className="mt-2 flex space-x-1">
      <Star className="w-4 h-4 text-yellow-500" />
      <Star className="w-4 h-4 text-yellow-500" />
      <Star className="w-4 h-4 text-yellow-500" />
      <Star className="w-4 h-4 text-gray-300" />
      <Star className="w-4 h-4 text-gray-300" />
    </div>
  </div>
)

export function FeaturesSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!isUserInteracting) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % features.length)
      }, 6000) // Increased timing for mockup interaction
      return () => clearInterval(interval)
    }
  }, [isUserInteracting])

  const handleUserInteraction = (callback: () => void) => {
    setIsUserInteracting(true)
    callback()

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Resume auto-scroll after 10 seconds for mockup exploration
    timeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false)
    }, 10000)
  }

  const goToPrevious = () => {
    handleUserInteraction(() => {
      setCurrentIndex((prev) => (prev - 1 + features.length) % features.length)
    })
  }

  const goToNext = () => {
    handleUserInteraction(() => {
      setCurrentIndex((prev) => (prev + 1) % features.length)
    })
  }

  const goToSlide = (index: number) => {
    handleUserInteraction(() => {
      setCurrentIndex(index)
    })
  }

  const currentFeature = features[currentIndex]
  const IconComponent = currentFeature.icon

  const renderMockup = () => {
    switch (currentFeature.mockup) {
      case "resolution":
        return <ResolutionMockup />
      case "networking":
        return <NetworkingMockup />
      case "crisis":
        return <CrisisMockup />
      case "achievements":
        return <AchievementsMockup />
      default:
        return null
    }
  }

  return (
    <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 max-w-4xl mx-auto overflow-visible sm:overflow-hidden">
      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-0 sm:left-1 md:left-2 top-1/2 -translate-y-1/2 bg-[#B22222] text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-[#D32F2F] transition-all hover:scale-110 z-10"
        aria-label="Previous feature"
      >
        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-0 sm:right-1 md:right-2 top-1/2 -translate-y-1/2 bg-[#B22222] text-white p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-[#D32F2F] transition-all hover:scale-110 z-10"
        aria-label="Next feature"
      >
        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>

      <div className="relative min-h-96 px-8 sm:px-10">
        <div
          className="absolute inset-0 transition-all duration-500 ease-in-out transform"
          style={{
            opacity: 1,
            transform: "translateX(0)",
          }}
        >
          {/* Feature Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Feature Description */}
            <div className="flex flex-col justify-center px-4">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full ${currentFeature.color} mb-4 sm:mb-5 md:mb-6 transition-all duration-300`}
              >
                <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#B22222] mb-3 sm:mb-4 font-serif transition-all duration-300">
                {currentFeature.title}
              </h3>

              <p className="text-gray-600 text-sm sm:text-base md:text-lg leading-relaxed transition-all duration-300">
                {currentFeature.description}
              </p>
            </div>

            {/* Interactive Mockup */}
            <div className="flex flex-col justify-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg p-4 border-2 border-dashed border-gray-300">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium">VOFMUN Platform Preview</span>
                </div>
                {renderMockup()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="flex justify-center space-x-1.5 sm:space-x-2 mt-6 sm:mt-8">
        {features.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-[#B22222] scale-110" : "bg-gray-300 hover:bg-gray-400"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Feature Navigation Pills */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {features.map((feature, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive ? "bg-[#B22222] text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {feature.title}
            </button>
          );
        })}
      </div>
    </div>
  )
}
