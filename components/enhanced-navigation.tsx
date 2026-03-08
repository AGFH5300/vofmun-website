// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

"use client"

import { useState, useEffect, type MouseEvent } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Menu, X, FileText, Building, Calendar, Scale, BookOpen } from "lucide-react"

export function EnhancedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigateToResourceSection = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    if (pathname !== "/resources") {
      return
    }

    event.preventDefault()

    const element = document.getElementById(sectionId)
    if (!element) {
      return
    }

    const offset = 120
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
    window.scrollTo({
      top: elementPosition - offset,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/95 backdrop-blur-md shadow-lg" : "bg-white/95 backdrop-blur-md shadow-md"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <Image src="/logo.svg" alt="VOFMUN Logo" width={40} height={40} className="rounded-full" />
            <span className={`font-bold text-xl transition-colors ${isScrolled ? "text-[#B22222]" : "text-[#B22222]"}`}>
              VOFMUN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`font-medium transition-colors hover:text-[#D32F2F] ${
                isScrolled ? "text-gray-900 hover:text-[#B22222]" : "text-gray-900 hover:text-[#B22222]"
              }`}
            >
              Home
            </Link>
            <div className="relative group">
              <button
                type="button"
                className={`font-medium transition-colors hover:text-[#D32F2F] flex items-center space-x-1 ${
                  isScrolled ? "text-gray-900 hover:text-[#B22222]" : "text-gray-900 hover:text-[#B22222]"
                }`}
              >
                <span>Conference Resources</span>
                <ChevronDown className="w-4 h-4" />
              </button>

              <div className="absolute top-full left-0 w-64 pt-2 opacity-0 invisible translate-y-1 transition-all duration-200 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:visible group-focus-within:translate-y-0">
                <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
                  <Link
                    href="/resources"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:bg-[#B22222] hover:text-white rounded-md transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Conference Overview</span>
                  </Link>
                  <Link
                    href="/resources#schedule"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:bg-[#B22222] hover:text-white rounded-md transition-colors"
                    onClick={(event) => navigateToResourceSection(event, "schedule")}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Schedule & Timeline</span>
                  </Link>
                  <Link
                    href="/resources#committees"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:bg-[#B22222] hover:text-white rounded-md transition-colors"
                    onClick={(event) => navigateToResourceSection(event, "committees")}
                  >
                    <Building className="w-4 h-4" />
                    <span>All Committees</span>
                  </Link>
                  <Link
                    href="/resources#handbooks"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:bg-[#B22222] hover:text-white rounded-md transition-colors"
                    onClick={(event) => navigateToResourceSection(event, "handbooks")}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Handbooks</span>
                  </Link>
                  <Link
                    href="/resources#rules"
                    className="flex items-center space-x-3 px-4 py-3 text-gray-900 hover:bg-[#B22222] hover:text-white rounded-md transition-colors"
                    onClick={(event) => navigateToResourceSection(event, "rules")}
                  >
                    <Scale className="w-4 h-4" />
                    <span>Rules & Procedures</span>
                  </Link>
                </div>
              </div>
            </div>
            <Link
              href="/delegate-referral-code"
              className={`font-medium transition-colors hover:text-[#D32F2F] inline-flex items-center gap-2 ${
                isScrolled ? "text-gray-900 hover:text-[#B22222]" : "text-gray-900 hover:text-[#B22222]"
              }`}
            >
              Delegate Referral
              <Badge className="bg-[#B22222] text-white hover:bg-[#B22222]">New</Badge>
            </Link>
            <Link
              href="/secretariat"
              className={`font-medium transition-colors hover:text-[#D32F2F] ${
                isScrolled ? "text-gray-900 hover:text-[#B22222]" : "text-gray-900 hover:text-[#B22222]"
              }`}
            >
              Secretariat
            </Link>
            <Link href="/signup">
              <Button className="bg-[#B22222] text-white hover:bg-[#D32F2F] hover:text-white px-6 py-2 rounded-lg font-medium transition-all hover:scale-105 shadow-lg border border-[#B22222]">
                Sign Up
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? "text-gray-900 hover:bg-gray-200" : "text-gray-900 hover:bg-gray-100"
            }`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="p-4 space-y-3">
              <Link href="/" className="block py-2 text-gray-900 hover:text-[#B22222] font-medium">
                Home
              </Link>
              <Link href="/resources" className="block py-2 text-gray-900 hover:text-[#B22222] font-medium">
                Conference Resources
              </Link>
              <Link href="/delegate-referral-code" className="flex items-center justify-between py-2 text-gray-900 hover:text-[#B22222] font-medium">
                <span>Delegate Referral</span>
                <Badge className="bg-[#B22222] text-white hover:bg-[#B22222]">New</Badge>
              </Link>
              <Link href="/secretariat" className="block py-2 text-gray-900 hover:text-[#B22222] font-medium">
                Secretariat
              </Link>
              <Link href="/signup" className="block">
                <Button className="w-full bg-[#B22222] hover:bg-[#D32F2F] text-white py-3 rounded-lg font-medium">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
