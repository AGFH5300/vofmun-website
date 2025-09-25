
"use client"

import { EnhancedNavigation } from "@/components/enhanced-navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Gavel, FileText, Users, Calendar, ExternalLink, ChevronRight } from "lucide-react"
import Image from "next/image"

export function ICJPage() {
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
                    src="/svgs/ICJ.svg"
                    alt="ICJ logo"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <Gavel className="h-10 w-10 text-amber-600 hidden" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#B22222]">
                    International Court of Justice
                  </h1>
                  <p className="text-gray-600">ICJ</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">Special Procedure</Badge>
              </div>

              <p className="text-lg text-gray-700 leading-relaxed">
                The ICJ is the principal judicial organ of the United Nations, settling legal disputes between states
                and providing advisory opinions on international legal questions.
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
                      <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                        <div className="flex items-start space-x-2 mb-2">
                          <ChevronRight className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                          <h3 className="font-semibold text-amber-600">Selected Case</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed ml-7">
                          Alleged Violations of Sovereign Rights and Maritime Jurisdiction in the South China Sea 
                          (Republic of the Philippines v. People's Republic of China)
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
                        The International Court of Justice (ICJ) is the principal judicial organ of the United Nations,
                        established in 1946. The Court settles legal disputes between states and gives advisory opinions
                        on legal questions referred to it by authorized UN organs and specialized agencies.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#B22222] mb-2">Key Procedures</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        <li>Contentious cases between states</li>
                        <li>Advisory proceedings on legal questions</li>
                        <li>Preliminary objections and jurisdiction</li>
                        <li>Evidence presentation and witness examination</li>
                        <li>Oral arguments and written pleadings</li>
                        <li>Judgment delivery and enforcement</li>
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
                      <Badge className="bg-blue-100 text-blue-800">Special Procedure</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Expected Delegates:</span>
                      <span className="text-gray-600">15-20</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Session Type:</span>
                      <span className="text-gray-600">Judicial Proceedings</span>
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
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent border-gray-200 hover:bg-gray-50"
                      asChild
                    >
                      <Link href="#">
                        <FileText className="h-4 w-4 mr-2" />
                        Case Documents
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent border-gray-200 hover:bg-gray-50"
                      asChild
                    >
                      <Link href="#">
                        <Users className="h-4 w-4 mr-2" />
                        Legal Precedents
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start bg-transparent border-gray-200 hover:bg-gray-50"
                      asChild
                    >
                      <Link href="#">
                        <Calendar className="h-4 w-4 mr-2" />
                        Procedure Guide
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg border-0">
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-lg font-serif font-bold text-white">Ready to Join?</h3>
                    <p className="text-white/90 text-sm">Register now to secure your spot in this committee.</p>
                    <Button asChild className="w-full bg-white text-amber-600 hover:bg-gray-100">
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
