"use client"

import { BookOpen, Calendar, Users, FileText } from "lucide-react"

export function ResourcesHero() {
  const scrollToDownload = () => {
    const downloadSection = document.querySelector("#rules .bg-gradient-to-r")
    if (downloadSection) {
      downloadSection.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#ffecdd] via-[#ffecdd] to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-[#B22222] leading-tight">Conference Resources</h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl mx-auto">
            Everything you need to prepare for VOFMUN 2026. From committee guides to schedules, we've got you covered.
          </p>

          {/* Quick Navigation */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <a
              href="#schedule"
              className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white hover:bg-gray-50 transition-colors group shadow-md"
            >
              <div className="p-3 bg-[#B22222]/10 rounded-full group-hover:bg-[#B22222]/20 transition-colors">
                <Calendar className="h-6 w-6 text-[#B22222]" />
              </div>
              <span className="text-sm font-medium text-gray-800">Schedule (Coming Soon)</span>
            </a>
            <a
              href="#committees"
              className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white hover:bg-gray-50 transition-colors group shadow-md"
            >
              <div className="p-3 bg-[#B22222]/10 rounded-full group-hover:bg-[#B22222]/20 transition-colors">
                <Users className="h-6 w-6 text-[#B22222]" />
              </div>
              <span className="text-sm font-medium text-gray-800">Committees</span>
            </a>
            <a
              href="#rules"
              className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white hover:bg-gray-50 transition-colors group shadow-md"
            >
              <div className="p-3 bg-[#B22222]/10 rounded-full group-hover:bg-[#B22222]/20 transition-colors">
                <FileText className="h-6 w-6 text-[#B22222]" />
              </div>
              <span className="text-sm font-medium text-gray-800">Rules</span>
            </a>
            <button
              onClick={scrollToDownload}
              className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-white hover:bg-gray-50 transition-colors group shadow-md cursor-pointer"
            >
              <div className="p-3 bg-[#B22222]/10 rounded-full group-hover:bg-[#B22222]/20 transition-colors">
                <BookOpen className="h-6 w-6 text-[#B22222]" />
              </div>
              <span className="text-sm font-medium text-gray-800">Resources</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}