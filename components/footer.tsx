// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import Link from "next/link"
import Image from "next/image"

const partners = [
  {
    title: "Venue Partner",
    name: "Arcadia Global School Dubai",
    logo: "/partners/ags.svg",
  },
  {
    title: "Event Partner",
    name: "Summit of Diplomacy",
    logo: "/partners/sod.svg",
  },
  {
    title: "Delegate Experience Partner",
    name: "UniHawk",
    logo: "/partners/unihawk.svg",
  },
  {
    title: "Partner",
    name: "ReModelUN",
    logo: "/partners/remodelun.svg",
  },
  {
    title: "Conference Sponsor",
    name: "Transmak Dewatering",
    logo: "/partners/transmak.svg",
  },
]

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-3 sm:mb-4">
              <span className="font-bold text-lg sm:text-xl">VOFMUN</span>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
              Empowering tomorrow's leaders through diplomatic excellence and global dialogue.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Quick Links</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/signup" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  Register
                </Link>
              </li>
              <li>
                <Link
                  href="/proof-of-payment"
                  className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  Proof of Payment
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/secretariat" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  Secretariat
                </Link>
              </li>
            </ul>
          </div>

          {/* Committees */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Committees</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link href="/committees/ga1" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  General Assembly
                </Link>
              </li>
              
              <li>
                <Link href="/committees/ecosoc" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  ECOSOC
                </Link>
              </li>
              <li>
                <Link href="/committees/who" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  WHO
                </Link>
              </li>
              <li>
                <Link href="/committees/unodc" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  UNODC
                </Link>
              </li>
              <li>
                <Link href="/committees/uncstd" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  UNCSTD
                </Link>
              </li>
              <li>
                <Link href="/committees/icj" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  ICJ
                </Link>
              </li>
              <li>
                <Link href="/committees/icrcc" className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm">
                  ICRCC
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Contact</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li className="text-gray-400 text-xs sm:text-sm">contact@vofmun.org</li>
              <li>
                <Link
                  href="https://www.linkedin.com/company/vofmun"
                  target="_blank"
                  className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  LinkedIn
                </Link>
              </li>
              <li>
                <Link
                  href="https://www.instagram.com/vofmun"
                  target="_blank"
                  className="text-gray-400 hover:text-white transition-colors text-xs sm:text-sm"
                >
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-800 pt-8">
          <h3 className="text-sm sm:text-base font-semibold tracking-wide text-gray-200 mb-4">Partners</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <div key={partner.name} className="rounded-xl border border-gray-800 bg-gray-950/60 p-4 sm:p-5">
                <div className="relative h-14 w-full mb-3 rounded-md bg-white/95 p-2">
                  <Image src={partner.logo} alt={`${partner.name} logo`} fill className="object-contain p-2" />
                </div>
                <p className="text-xs text-gray-400">{partner.title}</p>
                <p className="text-sm text-white font-medium">{partner.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2026 Voices of the Future Model United Nations. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm">
            Made by <a href="https://anshgupta.site" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Ansh Gupta</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
