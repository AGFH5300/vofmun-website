// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).


"use client"

import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ComingSoonDialog } from "@/components/coming-soon-dialog"
import { CountryMatrixDialog } from "@/components/country-matrix-dialog"
import Link from "next/link"
import { ArrowLeft, Shield, FileText, Calendar, ExternalLink, ChevronRight } from "lucide-react"
import Image from "next/image"
import unscMatrix from "@/lib/country-matrix/unsc.json"

export function UNSCPage() {
  return (
    <div className="min-h-screen bg-[#ffecdd]">
      <EnhancedNavigation />
      <main className="pt-16">
        {/* Header */}
        <section className="py-12 bg-gradient-to-br from-[#ffecdd] via-[#ffecdd] to-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <Button asChild variant="ghost" className="mb-6 text-gray-700 hover:text-[#B22222]">
                <Link href="/resources" className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to Resources</span>
                </Link>
              </Button>

              <div className="flex items-center space-x-4 mb-6">
                <div className="relative w-16 h-16 bg-white rounded-xl shadow-md border border-gray-200 flex items-center justify-center overflow-hidden">
                  <Image
                    src="/svgs/UNSC.svg"
                    alt="UNSC logo"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <Shield className="h-10 w-10 text-purple-600 hidden" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#B22222]">
                    United Nations Security Council
                  </h1>
                  <p className="text-gray-600">UNSC</p>
                </div>
                <Badge className="bg-red-100 text-red-800">Advanced</Badge>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed">
                The UNSC is tasked with maintaining international peace and security. This committee addresses urgent, high-stakes crises requiring decisive multilateral action.
              </p>
            </div>
          </div>
        </section>

        {/* Committee Details */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Topics */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-[#B22222]">
                      <FileText className="h-5 w-5 text-[#B22222]" />
                      <span>Committee Topics & Research Guides</span>
                      <ExternalLink className="h-4 w-4 text-[#B22222]" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                        <div className="flex items-start space-x-2 mb-2">
                          <ChevronRight className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                          <h3 className="font-semibold text-purple-600">Topic</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed ml-7">
                          Preventing Escalation of Border Disputes and Regional Conflicts in High-Risk Areas
                        </p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                        <div className="flex items-start space-x-2 mb-2">
                          <ChevronRight className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <h3 className="font-semibold text-indigo-600">Topic</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed ml-7">
                          The Geopolitical Implications of Nuclear, Chemical and Biological Weapons in Modern Conflicts
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Background Guide */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-[#B22222]">Background Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-[#B22222] mb-2">Committee Overview</h4>
                      <p className="text-gray-700 leading-relaxed">
                        The United Nations Security Council (UNSC) is one of the six principal organs of the United Nations,
                        with primary responsibility for maintaining international peace and security. It responds to threats
                        through resolutions, sanctions, peacekeeping mandates, and coordinated diplomatic action among member states.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#B22222] mb-2">Key Focus Areas</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Conflict prevention and international security</li>
                        <li>Disinformation and information warfare</li>
                        <li>Counter-terrorism and non-state threats</li>
                        <li>Biological threat preparedness and response</li>
                        <li>Crisis diplomacy and emergency decision-making</li>
                        <li>Sanctions, mandates, and peacekeeping tools</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Facts */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#B22222]">Committee Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Difficulty Level:</span>
                      <Badge className="bg-red-100 text-red-800">Advanced</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Expected Delegates:</span>
                      <span className="text-gray-600">15-20</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Session Type:</span>
                      <span className="text-gray-600">Security Council Session</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Language:</span>
                      <span className="text-gray-600">English</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Resources */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg text-[#B22222]">Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ComingSoonDialog label="Background Guide">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent border-gray-200 hover:bg-gray-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Background Guide
                      </Button>
                    </ComingSoonDialog>
                    <CountryMatrixDialog
                      committeeName="UNSC"
                      matrix={unscMatrix}
                      buttonClassName="w-full justify-start bg-transparent border-gray-200 hover:bg-gray-50"
                    />
                    <ComingSoonDialog label="Position Paper Guide">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent border-gray-200 hover:bg-gray-50"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Position Paper Guide
                      </Button>
                    </ComingSoonDialog>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg border-0">
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-lg font-serif font-bold text-white">Ready to Join?</h3>
                    <p className="text-white/90 text-sm">Register now to secure your spot in this committee.</p>
                    <Button asChild className="w-full bg-white text-red-600 hover:bg-gray-100">
                      <Link href="/signup">Register Now</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
