"use client"

import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ComingSoonDialog } from "@/components/coming-soon-dialog"
import Link from "next/link"
import { ArrowLeft, Shield, FileText, Users, Calendar, ExternalLink, AlertTriangle, ChevronRight } from "lucide-react"
import Image from "next/image"

export function ICRCCPage() {
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
                    src="/svgs/ICRCC.svg"
                    alt="ICRCC logo"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <Shield className="h-10 w-10 text-red-600 hidden" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#B22222]">
                    ICRCC - Crisis Committee
                  </h1>
                  <p className="text-gray-600">International Cybersecurity Response Crisis Council</p>
                </div>
                <Badge className="bg-rose-100 text-rose-800">Crisis</Badge>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed">
                A specialized crisis committee focused on cybersecurity threats and digital warfare, requiring 
                rapid decision-making and coordinated international responses to emerging cyber crises.
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
                      <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <h3 className="font-semibold text-red-600">Crisis Scenario</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          <strong>Classified!</strong> Keep an eye on our website, Instagram, and LinkedIn for updates and teasers :)
                        </p>
                        <div className="mt-3 p-3 bg-red-100 rounded border border-red-200">
                          <p className="text-sm text-red-700">
                            <strong>Note:</strong> Crisis scenarios will be revealed closer to the conference date. 
                            Delegates should prepare for rapid response to emerging cybersecurity crises and digital threats.
                          </p>
                        </div>
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
                        The International Cybersecurity Response Crisis Council (ICRCC) is a specialized crisis 
                        committee that simulates real-time cybersecurity emergencies and digital warfare scenarios. 
                        This committee focuses on coordinating international responses to cyber attacks, data breaches, 
                        and digital infrastructure threats that transcend national boundaries.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#B22222] mb-2">Crisis Committee Features</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Real-time cyber threat simulations</li>
                        <li>Cross-border digital incident response</li>
                        <li>Cybersecurity policy coordination</li>
                        <li>Digital forensics and attribution challenges</li>
                        <li>Public-private partnership dynamics</li>
                        <li>Rapid international cooperation mechanisms</li>
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
                      <Badge className="bg-rose-100 text-rose-800">Crisis</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Expected Delegates:</span>
                      <span className="text-gray-600">20-25</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Session Type:</span>
                      <span className="text-gray-600">Crisis Committee</span>
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
                    <ComingSoonDialog label="Crisis Guide">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent border-gray-200 hover:bg-gray-50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Crisis Guide
                      </Button>
                    </ComingSoonDialog>
                    <ComingSoonDialog label="Portfolio Powers">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent border-gray-200 hover:bg-gray-50"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Portfolio Powers
                      </Button>
                    </ComingSoonDialog>
                    <ComingSoonDialog label="Crisis Procedures">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent border-gray-200 hover:bg-gray-50"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Crisis Procedures
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
