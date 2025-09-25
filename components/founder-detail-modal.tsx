"use client"

import { X, Linkedin, Mail } from "lucide-react"
import Image from "next/image"
import { useEffect } from "react"

interface Founder {
  name: string
  role: string
  department: string
  image: string
  bio: string
  linkedin: string
  email: string
  achievements: string[]
  quote: string
}

interface FounderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  founder: Founder | null
}

export function FounderDetailModal({ isOpen, onClose, founder }: FounderDetailModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = "unset"
    }
  }, [isOpen, onClose])

  if (!isOpen || !founder) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col md:flex-row max-h-[90vh]">
          {/* Left side - Image */}
          <div className="md:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
            <div className="relative w-64 h-80 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={founder.image}
                alt={founder.name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 256px"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="md:w-1/2 p-8 overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{founder.name}</h2>
                <p className="text-xl text-[#B22222] font-medium mb-4">{founder.role}</p>
                <div className="inline-block px-3 py-1 bg-[#B22222]/10 text-[#B22222] rounded-full text-sm font-medium">
                  {founder.department}
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed">{founder.bio}</p>
              </div>

              {/* Quote */}
              <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-[#B22222]">
                <p className="text-gray-700 italic">"{founder.quote}"</p>
              </div>

              {/* Achievements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Achievements</h3>
                <ul className="space-y-2">
                  {founder.achievements.map((achievement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-[#B22222] rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-700">{achievement}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              {(founder.linkedin?.trim() || founder.email?.trim()) && (
                <div className="flex space-x-4 pt-4 border-t">
                  {founder.linkedin && founder.linkedin.trim() && (
                    <a
                      href={founder.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {founder.email && founder.email.trim() && (
                    <a
                      href={`mailto:${founder.email}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}