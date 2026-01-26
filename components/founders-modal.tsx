"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const founders = [
  {
    name: "Tala Swaidan",
    role: "Founder & Secretary-General",
    image: "/founders/TalaSwaidan_SG.png",
  },
  {
    name: "Vihaan Shukla",
    role: "Co-Founder & Director General",
    image: "/founders/VihaanShukla_ConferenceAffairs.png",
  },
  {
    name: "Ansh Gupta",
    role: "Head of Technology",
    image: "/founders/AnshGupta_Tech.png",
  },
  {
    name: "Vaibhav Kiran Mundanat",
    role: "Co-Head of Committees",
    image: "/founders/VaibhavMundanat_Media.png",
  },
  {
    name: "Vidur Aravind Kumar",
    role: "Co-Head of Committees",
    image: "/founders/VidurKumar_Committees.jpeg",
  },
  {
    name: "Arsh Saxena",
    role: "Deputy of Committees",
    image: "/founders/ArshSaxena_Committees.jpeg",
  },
  {
    name: "Vyom Patel",
    role: "Head of Logistics",
    image: "/founders/VyomPatel_Logistics.png",
  },
  {
    name: "Aryan Shah",
    role: "Deputy of Logistics",
    image: "/founders/AryanShah_Committees.jpg",
  },
  {
    name: "Armaghan Siddiqui",
    role: "Head of Finance",
    image: "/founders/MuhammadArmaghanSiddiqui_Finance.png",
  },
  {
    name: "Pranav Verma",
    role: "Deputy of Finance",
    image: "/founders/PranavVerma_Finance.jpg",
  },
  {
    name: "Noaf Qassem",
    role: "Deputy of Finance",
    image: "/founders/NoafQassem_Finance.png",
  },
  {
    name: "Gibran Malaeb",
    role: "Head of Media & Marketing",
    image: "/founders/GibranMalaeb_Media.jpg",
  },
  {
    name: "Tamara Moshawrab",
    role: "Deputy of Media & Marketing",
    image: "/founders/TamaraMoshawrab_Media.png",
  },
  {
    name: "Saira Shirvaikar",
    role: "Deputy of Media & Marketing",
    image: "/founders/SairaShirvaikar_Media.jpeg",
  },
]

interface FoundersModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FoundersModal({ isOpen, onClose }: FoundersModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] w-full mx-4 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#B22222] to-[#8B0000] text-white p-6 text-center">
          <h2 className="text-2xl md:text-3xl font-serif font-bold">Meet the Secretariat</h2>
          <p className="text-white/90 mt-2">Founders, heads, and deputies working together to deliver an exceptional VOFMUN experience.</p>
        </div>

        {/* Static Founders Gallery */}
        <div className="p-6">

          {/* Current Founder Display */}
          <div className="flex flex-col items-center text-center max-w-md mx-auto">
            <div className="relative w-64 h-80 mb-6 rounded-xl overflow-hidden shadow-lg">
              <Image
                src={founders[currentIndex].image}
                alt={founders[currentIndex].name}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 256px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {founders[currentIndex].name}
            </h3>
            <p className="text-lg text-[#B22222] font-medium mb-4">
              {founders[currentIndex].role}
            </p>
          </div>

          {/* Founders Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
            {founders.slice(0, 8).map((founder, index) => (
              <div key={index} className="text-center">
                <div className="relative w-16 h-20 mx-auto mb-2 rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover object-center"
                    sizes="64px"
                  />
                </div>
                <h4 className="text-xs font-semibold text-gray-900 leading-tight">{founder.name}</h4>
                <p className="text-xs text-gray-600">{founder.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Link */}
        <div className="bg-gray-50 p-6 text-center border-t">
          <Link
            href="/secretariat"
            onClick={onClose}
            className="inline-flex items-center space-x-2 bg-[#B22222] hover:bg-[#8B0000] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <span>Explore the Secretariat</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
