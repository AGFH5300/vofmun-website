import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "lucide-react"

const scheduleData = [
  {
    day: "Day 1 - January 23, 2026",
    events: [
      {
        time: "8:00 AM - 9:00 AM",
        event: "Registration & Welcome Coffee",
        type: "registration",
      },
      {
        time: "9:00 AM - 9:30 AM",
        event: "Opening Ceremony",
        type: "ceremony",
      },
      {
        time: "9:30 AM - 10:00 AM",
        event: "Committee Introductions",
        type: "committee",
      },
      {
        time: "10:00 AM - 12:00 PM",
        event: "First Committee Session",
        type: "session",
      },
      {
        time: "12:00 PM - 1:00 PM",
        event: "Lunch Break",
        type: "break",
      },
      {
        time: "1:00 PM - 3:00 PM",
        event: "Second Committee Session",
        type: "session",
      },
      {
        time: "3:00 PM - 3:30 PM",
        event: "Afternoon Break",
        type: "break",
      },
      {
        time: "3:30 PM - 5:30 PM",
        event: "Third Committee Session",
        type: "session",
      },
    ],
  },
  {
    day: "Day 2 - January 24, 2026",
    events: [
      {
        time: "9:00 AM - 11:00 AM",
        event: "Fourth Committee Session",
        type: "session",
      },
      {
        time: "11:00 AM - 11:30 AM",
        event: "Morning Break",
        type: "break",
      },
      {
        time: "11:30 AM - 1:00 PM",
        event: "Fifth Committee Session",
        type: "session",
      },
      {
        time: "1:00 PM - 2:00 PM",
        event: "Lunch Break",
        type: "break",
      },
      {
        time: "2:00 PM - 4:00 PM",
        event: "Sixth Committee Session & Draft Resolutions",
        type: "session",
      },
      {
        time: "4:00 PM - 4:30 PM",
        event: "Afternoon Break",
        type: "break",
      },
      {
        time: "4:30 PM - 6:00 PM",
        event: "Seventh Committee Session",
        type: "session",
      },
    ],
  },
  {
    day: "Day 3 - January 25, 2026",
    events: [
      {
        time: "9:00 AM - 11:00 AM",
        event: "Final Committee Session & Voting",
        type: "session",
      },
      {
        time: "11:00 AM - 11:30 AM",
        event: "Morning Break",
        type: "break",
      },
      {
        time: "11:30 AM - 1:00 PM",
        event: "General Assembly",
        type: "assembly",
      },
      {
        time: "1:00 PM - 2:00 PM",
        event: "Lunch Break",
        type: "break",
      },
      {
        time: "2:00 PM - 3:00 PM",
        event: "Awards Ceremony",
        type: "ceremony",
      },
      {
        time: "3:00 PM - 4:00 PM",
        event: "Closing Reception",
        type: "reception",
      },
    ],
  },
]

const getEventTypeColor = (type: string) => {
  switch (type) {
    case "registration":
      return "bg-blue-100 text-blue-800 hover:bg-blue-300"
    case "ceremony":
      return "bg-purple-100 text-purple-800 hover:bg-purple-300"
    case "committee":
      return "bg-green-100 text-green-800 hover:bg-green-300"
    case "session":
      return "bg-yellow-100 text-primary hover:bg-yellow-300"
    case "break":
      return "bg-gray-100 text-gray-800 hover:bg-gray-300"
    case "assembly":
      return "bg-red-100 text-red-800 hover:bg-red-300"
    case "reception":
      return "bg-red-100 text-red-800 hover:bg-red-300"
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-300"
  }
}

export function ScheduleSection() {
  return (
    <section id="schedule" className="py-12" style={{ backgroundColor: "#ffecdd" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">Conference Schedule</h2>
            <p className="text-lg text-gray-700">
              A comprehensive three-day program designed to maximize your diplomatic experience.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {scheduleData.map((day, dayIndex) => (
              <Card key={dayIndex} className="diplomatic-shadow border-0">
                <CardHeader className="vofmun-gradient text-gray-700">
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>{day.day}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-0">
                    {day.events.map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className="p-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold text-black">{event.event}</h4>
                              <div className="flex items-center space-x-1 mt-1 text-sm text-gray-700">
                                <Clock className="h-3 w-3" />
                                <span>{event.time}</span>
                              </div>
                            </div>
                            <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
