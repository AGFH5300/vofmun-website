
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, ExternalLink, Globe, Heart, Shield, Gavel, ChevronRight } from "lucide-react"
import Image from "next/image"

const committees = [
  // Beginner Level
  {
    name: "General Assembly 1 - Disarmament & International Security Committee",
    fullName: "Disarmament and International Security Committee",
    acronym: "GA1 - DISEC",
    icon: Globe,
    logo:"/svgs/GA1.svg",
    topics: [
      "Addressing Outer Space Militarisation, Need for Intl Regulations",
      "Regulating AI Use & Human Accountability in Cyber-Warfare",
    ],
    difficulty: "Beginner",
    delegates: "30-40",
    href: "/committees/ga1",
  },
  {
    name: "World Health Organization",
    fullName: "World Health Organisation",
    acronym: "WHO",
    icon: Heart,
    logo:"/svgs/WHO.svg",
    topics: [
      "Addressing Algorithmic Bias in Healthcare Diagnostic Tech",
      "Strengthening Global Vaccine Equity",
    ],
    difficulty: "Beginner",
    delegates: "30-35",
    href: "/committees/who",
  },
  // Intermediate Level
  {
    name: "UN Office on Drugs and Crime",
    fullName: "United Nations Office on Drugs and Crime",
    acronym: "UNODC",
    icon: Shield,
    logo:"/svgs/UNODC.svg",
    topics: [
      "Strengthening Tech & Intl Law to Combat Drug Cartels",
      "Combatting Cryptocurrencies as Tool for Money Laundering",
    ],
    difficulty: "Intermediate",
    delegates: "25-30",
    href: "/committees/unodc",
  },
  {
    name: "Economic and Social Council",
    fullName: "Economic and Social Council",
    acronym: "ECOSOC",
    icon: Users,
    logo:"/svgs/ECOSOC.svg",
    topics: [
      "Reforming Global Supply Chain to Reduce Trade Disruptions",
      "Economic Impacts of AI on Global Labour Market",
    ],
    difficulty: "Intermediate",
    delegates: "25-30",
    href: "/committees/ecosoc",
  },
  // Advanced Level
  {
    name: "UN Commission on Science and Tech for Development",
    fullName: "UN Commission on Science and Technology for Development",
    acronym: "UNCSTD",
    icon: Shield,
    logo:"/svgs/UNCSTD.svg",
    topics: [
      "Preventing Crises from Autonomous AI Governing Critical Infrastructure",
      "Promoting Global Data Sharing to Support Research & Development",
    ],
    difficulty: "Advanced",
    delegates: "20-25",
    href: "/committees/uncstd",
  },
  // Special Procedure
  {
    name: "International Cybersecurity Response Crisis Council",
    fullName: "International Cybersecurity Response Crisis Council",
    acronym: "ICRCC",
    icon: Shield,
    logo:"/svgs/ICRCC.svg",
    topics: [
      "Classified! Keep an eye on our website, Instagram, and LinkedIn for updates and teasers :)",
    ],
    difficulty: "Crisis",
    delegates: "20-25",
    href: "/committees/icrcc",
  },
  {
    name: "International Court of Justice",
    fullName: "International Court of Justice",
    acronym: "ICJ",
    icon: Gavel,
    logo:"/svgs/ICJ.svg",
    topics: [
      "Violations of Sovereign Rights & Jurisdiction in South China Sea (Philippines vs. P.R. China)",
    ],
    difficulty: "Special Procedure",
    delegates: "15-20",
    href: "/committees/icj",
  },
]

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "Beginner":
      return "bg-green-100 text-green-800 hover:bg-green-200 hover:text-green-900 transition-colors cursor-pointer"
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 hover:text-yellow-900 transition-colors cursor-pointer"
    case "Advanced":
      return "bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 transition-colors cursor-pointer"
    case "Expert":
      return "bg-purple-100 text-purple-800 hover:bg-purple-200 hover:text-purple-900 transition-colors cursor-pointer"
    case "Crisis":
      return "bg-rose-100 text-rose-800 hover:bg-rose-200 hover:text-rose-900 transition-colors cursor-pointer"
    case "Special Procedure":
      return "bg-blue-100 text-blue-800 hover:bg-blue-200 hover:text-blue-900 transition-colors cursor-pointer"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
  }
}

export function CommitteesSection() {
  return (
    <section id="committees" className="py-12" style={{ backgroundColor: "#f5f5f0" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">Committees & Topics</h2>
            <p className="text-lg text-foreground/80">
              Explore our diverse range of committees addressing the most pressing global challenges of our time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {committees.map((committee, index) => {
              const IconComponent = committee.icon
              return (
                <Card key={index} className="hover-lift diplomatic-shadow border-0 h-full flex flex-col">
                  <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="relative w-16 h-16 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden">
                        <Image
                          src={committee.logo}
                          alt={`${committee.acronym} logo`}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            // Fallback to icon if logo fails to load
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                        <IconComponent className="h-6 w-6 text-primary hidden" />
                      </div>
                      <Badge className={getDifficultyColor(committee.difficulty)}>{committee.difficulty}</Badge>
                    </div>
                    <div>
                      <CardTitle className="text-xl font-serif text-primary">{committee.name}</CardTitle>
                      <p className="text-sm text-muted-foreground font-mono">{committee.acronym}</p>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h4 className="font-semibold text-foreground mb-3">Topics:</h4>
                      <div className="space-y-3 text-sm text-foreground/80">
                        {committee.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-start space-x-2">
                            <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="leading-relaxed">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{committee.delegates} delegates</span>
                      </div>
                    </div>

                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-primary text-primary hover:bg-primary-500 bg-transparent mt-auto"
                    >
                      <Link href={committee.href} className="flex items-center space-x-2">
                        <span>Learn More</span>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}