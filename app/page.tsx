"use client";

import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FoundersModal } from "@/components/founders-modal";
import { LiveCrisisTracker } from "@/components/live-crisis-tracker";
import { EnhancedNavigation } from "@/components/enhanced-navigation";
import { ScrollProgress } from "@/components/scroll-progress";
import { BackToTop } from "@/components/back-to-top";
import { ClientScripts } from "@/components/client-scripts";
import { FeaturesSlideshow } from "@/components/features-slideshow";
import { LiveCountdownTimer } from "@/components/live-countdown-timer";
import { FoundersInfiniteCarousel } from "@/components/founders-infinite-carousel";
import { InteractiveWorldMap } from "@/components/interactive-world-map";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const [isFoundersModalOpen, setIsFoundersModalOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#ffecdd]">
      <EnhancedNavigation />
      <ScrollProgress />

      <main className="pt-0">
        <section className="relative overflow-hidden min-h-screen flex items-center pt-16">
          <div className="absolute inset-0 bg-gradient-to-br from-[#B22222] via-[#D32F2F] to-[#B22222]">
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10 text-center text-white py-8">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 font-serif animate-fade-in">
              <span className="text-white drop-shadow-lg">
                Voices of the Future
              </span>
            </h1>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 font-serif animate-fade-in-delay text-white drop-shadow-lg">
              Model United Nations I
            </h1>
            <p className="text-2xl mb-8 animate-fade-in-delay-2 font-light text-white drop-shadow-lg">
              Debate • Diplomacy • Difference
            </p>

            {/* Conference Countdown */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 inline-block border border-white/30 animate-fade-in-delay-2 mb-8">
              <h3 className="text-2xl font-bold mb-4 font-serif text-white drop-shadow-lg">
                Conference begins in
              </h3>
              <LiveCountdownTimer />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-delay-2">
              <Link href="/signup">
                <Button className="bg-white text-[#B22222] hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-xl">
                  Register Now
                </Button>
              </Link>
              <Link href="/resources">
                <Button className="bg-gray-900 border-2 border-white text-white hover:bg-gray-100 hover:text-gray-900 px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-xl">
                  Explore Resources
                </Button>
              </Link>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 inline-block border border-white/30 animate-fade-in-delay-2 mb-10 sm:mb-12">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8">
                <div className="text-center">
                  <div
                    className="text-3xl font-bold counter-animate text-white drop-shadow-lg"
                    id="delegate-counter"
                    style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}
                  >
                    250+
                  </div>
                  <div className="text-sm text-white/90 drop-shadow" style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}>
                    Expected Delegates
                  </div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/50"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white drop-shadow-lg" style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}>
                    28-29 Mar
                  </div>
                  <div className="text-sm text-white/90 drop-shadow" style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}>2026</div>
                </div>
                <div className="hidden sm:block w-px h-12 bg-white/50"></div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white drop-shadow-lg" style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}>
                    7
                  </div>
                  <div className="text-sm text-white/90 drop-shadow" style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}>
                    Committees
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <ChevronDown className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-white opacity-80 hover:opacity-100 transition-opacity cursor-pointer" />
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-[#ffecdd] to-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-[#B22222] text-center mb-4 font-serif">
              Interactive Conference Platform
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Our conference webapp has been developed in-house to provide all our delegates, chairs, and admin staff with a seamless and intuitive experience. 
              VOFMUN One - our custom-built platform - integrates all essential tools and resources needed for effective participation throughout the conference!
            </p>
            <FeaturesSlideshow />
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-[#B22222] text-center mb-4 font-serif">
              Meet the Secretariat
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto text-base">
              Get to know the founders, heads, and deputies who power VOFMUN.
            </p>

            <FoundersInfiniteCarousel />

            <div className="text-center mt-8">
              <Link
                href="/secretariat"
                className="inline-flex items-center space-x-2 bg-gray-700 hover:bg-gray-800 text-white px-8 py-4 rounded-lg font-medium transition-all duration-300 hover:scale-105 shadow-lg"
              >
                <span>Explore the Secretariat</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>

            <FoundersModal
              isOpen={isFoundersModalOpen}
              onClose={() => setIsFoundersModalOpen(false)}
            />
          </div>
        </section>

        <section className="py-20 bg-[#ffecdd]">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-[#B22222] text-center mb-4 font-serif">
              Follow Our Socials
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Stay connected with VOFMUN for the latest updates,
              behind-the-scenes content, and conference highlights.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center max-w-2xl mx-auto">
              <a
                href="https://www.linkedin.com/company/vofmun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 bg-[#B22222] hover:bg-[#8B0000] text-white px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group min-w-[200px]"
              >
                <svg
                  className="w-8 h-8 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <div>
                  <div className="font-bold text-lg">LinkedIn</div>
                  <div className="text-sm opacity-90">Professional updates</div>
                </div>
              </a>

              <a
                href="https://www.instagram.com/vofmun"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-4 bg-gradient-to-r from-[#B22222] via-[#8B0000] to-[#B22222] hover:from-[#8B0000] hover:via-[#B22222] hover:to-[#8B0000] text-white px-8 py-4 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group min-w-[200px]"
              >
                <svg
                  className="w-8 h-8 group-hover:scale-110 transition-transform"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <div>
                  <div className="font-bold text-lg">Instagram</div>
                  <div className="text-sm opacity-90">
                    Conference highlights
                  </div>
                </div>
              </a>
            </div>
          </div>
        </section>

        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-[#B22222] text-center mb-4 font-serif">
              Diverse Participation
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Our conference brings together a diverse community of delegates, each bringing unique perspectives shaped by their cultures and backgrounds.
              VOFMUN is a celebration of global thinking, where debate and diplomacy connect people to make a true difference.
            </p>
            <div className="max-w-4xl mx-auto">
              <InteractiveWorldMap />
            </div>
          </div>
        </section>

        
      </main>

      <Footer />
      <BackToTop />
      <ClientScripts />
    </div>
  );
}
