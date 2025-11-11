import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

export function ScheduleSection() {
  return (
    <section id="schedule" className="py-12" style={{ backgroundColor: "#ffecdd" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="diplomatic-shadow border-0 bg-white/95">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#B22222]/10">
                <Calendar className="h-6 w-6 text-[#B22222]" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-primary">
                Detailed Schedule Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-center px-6 pb-8">
              <p className="text-sm sm:text-base text-gray-700">
                We're finalizing an exciting two-day program for 14-15 February 2026. The full timetable, including committee
                sessions, workshops, and ceremonies, will be published shortly.
              </p>
              <p className="text-sm sm:text-base text-gray-700">
                Subscribe to our newsletter and follow us on social media to be the first to know when the schedule goes live.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
