
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
import uncstdMatrix from "@/lib/country-matrix/uncstd.json"

export function UNCSTDPage() {
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
                    src="/svgs/UNCSTD.svg"
                    alt="UNCSTD logo"
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
                    UN Commission on Science and Technology for Development
                  </h1>
                  <p className="text-gray-600">UNCSTD</p>
                </div>
                <Badge className="bg-red-100 text-red-800">Advanced</Badge>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed">
                UNCSTD serves as a focal point for science and technology matters within the UN system, providing 
                leadership in developing policies and strategies for harnessing technology for development.
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
                          Preventing Ethical and Economic Crises from Autonomous AI Systems Governing Critical Infrastructure and Workforces
                        </p>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
                        <div className="flex items-start space-x-2 mb-2">
                          <ChevronRight className="h-5 w-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                          <h3 className="font-semibold text-indigo-600">Topic</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed ml-7">
                          Promoting Global Data Sharing Policies to Support Scientific Research and Development
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
                        The UN Commission on Science and Technology for Development (CSTD) is a subsidiary body of the 
                        Economic and Social Council (ECOSOC). Established in 1992, CSTD serves as the UN's focal point 
                        for science, technology, and innovation matters within the United Nations system, providing 
                        leadership in developing policies and strategies for harnessing science, technology and innovation for development.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#B22222] mb-2">Key Focus Areas</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Artificial intelligence governance and ethics</li>
                        <li>Digital transformation and infrastructure</li>
                        <li>Science, technology and innovation policy</li>
                        <li>Data governance and privacy</li>
                        <li>Emerging technologies assessment</li>
                        <li>Technology transfer and capacity building</li>
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
                      <span className="text-gray-600">20-25</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Session Type:</span>
                      <span className="text-gray-600">Formal Debate</span>
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
                      committeeName="UNCSTD"
                      matrix={uncstdMatrix}
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
