
"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const founders = [
  {
    name: "Tala Swaidan",
    role: "Founder, Secretary-General",
    image: "/founders/TalaSwaidan_SG.jpg",
  },
  {
    name: "Vihaan Shukla",
    role: "Co-Founder, Director-General",
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

export function FoundersInfiniteCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % founders.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % founders.length)
    setTimeout(() => setIsAutoPlaying(true), 6000)
  }

  const prevSlide = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + founders.length) % founders.length)
    setTimeout(() => setIsAutoPlaying(true), 6000)
  }

  const getVisibleFounders = () => {
    const visible = []
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + founders.length) % founders.length
      visible.push({ ...founders[index], position: i })
    }
    return visible
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto h-96 overflow-hidden">
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 bg-[#B22222] hover:bg-[#8B0000] text-white p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Previous founder"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 bg-[#B22222] hover:bg-[#8B0000] text-white p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Next founder"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Carousel Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {getVisibleFounders().map((founder, index) => {
          const position = founder.position
          const isCenter = position === 0

          // Calculate transform and styling based on position
          let transform = `translateX(${position * 280}px)`
          let scale = 1
          let opacity = 1
          let zIndex = 10

          if (isCenter) {
            scale = 1.2
            zIndex = 30
            opacity = 1
          } else if (Math.abs(position) === 1) {
            scale = 0.9
            zIndex = 20
            opacity = 0.8
          } else {
            scale = 0.7
            zIndex = 10
            opacity = 0.5
          }

          return (
            <div
              key={`${founder.name}-${index}`}
              className="absolute transition-all duration-700 ease-in-out cursor-pointer"
              style={{
                transform: `${transform} scale(${scale})`,
                zIndex,
                opacity,
              }}
              onClick={() => {
                if (!isCenter) {
                  setCurrentIndex((currentIndex + position + founders.length) % founders.length)
                }
              }}
            >
              <Link
                href="/secretariat"
                className="block group"
              >
                <div className={`relative bg-white rounded-2xl overflow-hidden shadow-lg transition-all duration-300 w-64 h-80 ${
                  isCenter 
                    ? 'shadow-2xl' 
                    : 'shadow-md hover:shadow-xl'
                }`}>

                  {/* Background gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10" />

                  {/* Founder Image */}
                  <div className="relative w-full h-full">
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Text Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white z-20">
                    <h3 className={`font-bold mb-2 drop-shadow-lg transition-all duration-300 ${
                      isCenter ? 'text-2xl' : 'text-xl'
                    }`}>
                      {founder.name}
                    </h3>
                    <p className={`opacity-90 drop-shadow transition-all duration-300 ${
                      isCenter ? 'text-base' : 'text-sm'
                    }`}>
                      {founder.role}
                    </p>
                  </div>

                  {/* Center highlight overlay */}
                  {isCenter && (
                    <div className="absolute inset-0 bg-gradient-to-t from-[#B22222]/20 via-transparent to-transparent z-15" />
                  )}

                  {/* Hover overlay for non-center cards */}
                  {!isCenter && (
                    <div className="absolute inset-0 bg-[#B22222]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15" />
                  )}
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
