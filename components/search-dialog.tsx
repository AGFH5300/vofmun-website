"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, Users, Calendar } from "lucide-react"
import Link from "next/link"

const searchResults = [
  {
    title: "General Assembly Committee",
    description: "Learn about GA1 topics and procedures",
    href: "/committees/ga1",
    icon: FileText,
    category: "Committee",
  },
  {
    title: "Conference Schedule",
    description: "View the complete conference timeline",
    href: "/resources#schedule",
    icon: Calendar,
    category: "Resources",
  },
  {
    title: "Secretariat",
    description: "Meet the founders, heads, and deputies",
    href: "/secretariat",
    icon: Users,
    category: "About",
  },
  {
    title: "Registration",
    description: "Sign up for VOFMUN 2026",
    href: "/signup",
    icon: Users,
    category: "Registration",
  },
]

export function SearchDialog() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const filteredResults = searchResults.filter(
    (result) =>
      result.title.toLowerCase().includes(query.toLowerCase()) ||
      result.description.toLowerCase().includes(query.toLowerCase()) ||
      result.category.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Search VOFMUN</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for committees, resources, or information..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {query && (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filteredResults.length > 0 ? (
                filteredResults.map((result, index) => {
                  const IconComponent = result.icon
                  return (
                    <Link
                      key={index}
                      href={result.href}
                      onClick={() => setOpen(false)}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 bg-primary/10 rounded-full">
                        <IconComponent className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground">{result.title}</h4>
                        <p className="text-sm text-muted-foreground">{result.description}</p>
                        <span className="text-xs text-accent">{result.category}</span>
                      </div>
                    </Link>
                  )
                })
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No results found for "{query}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
