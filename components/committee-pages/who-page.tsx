
"use client"

import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ComingSoonDialog } from "@/components/coming-soon-dialog"
import { CountryMatrixDialog } from "@/components/country-matrix-dialog"
import Link from "next/link"
import { ArrowLeft, Heart, FileText, Calendar, ExternalLink, ChevronRight } from "lucide-react"
import Image from "next/image"
import whoMatrix from "@/lib/country-matrix/who.json"

export function WHOPage() {
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
                    src="/svgs/WHO.svg"
                    alt="WHO logo"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <Heart className="h-10 w-10 text-blue-600 hidden" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#B22222]">
                    World Health Organization
                  </h1>
                  <p className="text-gray-600">WHO</p>
                </div>
                <Badge className="bg-green-100 text-green-800">Beginner</Badge>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed">
                WHO leads global health initiatives, sets health standards, and coordinates international health
                responses to promote health, keep the world safe, and serve the vulnerable.
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
                      <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start space-x-2 mb-2">
                          <ChevronRight className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <h3 className="font-semibold text-blue-600">Topic</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed ml-7">
                          Addressing Algorithmic Bias in Healthcare Diagnostics Through the Use of Emerging Technologies
                        </p>
                      </div>
                      <div className="p-4 bg-teal-50 rounded-lg border-l-4 border-teal-500">
                        <div className="flex items-start space-x-2 mb-2">
                          <ChevronRight className="h-5 w-5 text-teal-600 mt-0.5 flex-shrink-0" />
                          <h3 className="font-semibold text-teal-600">Topic</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed ml-7">
                          Strengthening Global Vaccine Equity and Preparedness for Emerging Infectious Diseases
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
                        The World Health Organization (WHO) is the directing and coordinating authority on international
                        health within the United Nations system. Established in 1948, WHO works worldwide to promote
                        health, keep the world safe, and serve the vulnerable through evidence-based policies and
                        programs.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#B22222] mb-2">Key Focus Areas</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Universal health coverage and health systems strengthening</li>
                        <li>Health emergency preparedness and response</li>
                        <li>Promoting health through the life-course</li>
                        <li>Noncommunicable diseases and mental health</li>
                        <li>Infectious disease prevention and control</li>
                        <li>Health equity and social determinants of health</li>
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
                      <Badge className="bg-green-100 text-green-800">Beginner</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Expected Delegates:</span>
                      <span className="text-gray-600">30-35</span>
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
                      committeeName="WHO"
                      matrix={whoMatrix}
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

                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg border-0">
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-lg font-serif font-bold text-white">Ready to Join?</h3>
                    <p className="text-white/90 text-sm">Register now to secure your spot in this committee.</p>
                    <Button asChild className="w-full bg-white text-blue-600 hover:bg-gray-100">
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
