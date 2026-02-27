// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import Link from "next/link"
import Image from "next/image"

const partners = [
  {
    title: "Venue Partner",
    name: "Arcadia Global School Dubai",
    logo: "/partners/ags.svg",
    website: "https://arcadiaglobal.sch.ae/",
  },
  {
    title: "Event Partner",
    name: "Summit of Diplomacy",
    logo: "/partners/sod.svg",
    website: "https://sodmun.com/",
  },
  {
    title: "Delegate Experience Partner",
    name: "UniHawk",
    logo: "/partners/unihawk.svg",
    website: "https://www.unihawk.com/",
  },
  {
    title: "Partner",
    name: "ReModelUN",
    logo: "/partners/remodelun.svg",
    website: "https://www.remodelun.org/",
  },
  {
    title: "Conference Sponsor",
    name: "Transmak Dewatering",
    logo: "/partners/transmak.svg",
    website: "https://www.transmak.ae/",
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
              Empowering tomorrow&apos;s leaders through diplomatic excellence and global dialogue.
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

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 px-4 py-7 sm:px-6 sm:py-8">
          <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <h3 className="text-sm sm:text-base font-semibold tracking-wide text-gray-100">Our Partners</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {partners.map((partner) => (
              <Link
                key={partner.name}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5 transition-all duration-300 hover:-translate-y-1 hover:border-sky-300/40 hover:bg-slate-800/40 hover:shadow-[0_18px_40px_-24px_rgba(56,189,248,0.8)]"
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-gradient-to-r from-slate-900/70 via-slate-800/50 to-slate-900/70 p-2">
                    <Image src={partner.logo} alt={`${partner.name} logo`} fill className="object-contain p-2" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-sky-200/70">{partner.title}</p>
                    <p className="mt-1 text-sm font-medium text-white transition-colors group-hover:text-sky-200">{partner.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
          <p className="text-gray-400 text-xs sm:text-sm">
            © 2026 Voices of the Future Model United Nations. All rights reserved.
          </p>
          <p className="text-xs sm:text-sm">
            Made by{" "}
            <a href="https://anshgupta.site" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              Ansh Gupta
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
