// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "lucide-react"

type ScheduleRow = {
  time: string
  event: string
}

type ScheduleDay = {
  title: string
  rows: ScheduleRow[]
}

const scheduleByDay: ScheduleDay[] = [
  {
    title: "DAY 1 - Friday",
    rows: [
      { time: "13:30 - 14:00", event: "Registration/Chair Briefing" },
      { time: "14:00 - 15:00", event: "Opening Ceremony" },
      { time: "15:00 - 16:00", event: "Committee Session 1" },
      { time: "16:00 - 16:30", event: "In-Committee Break" },
      { time: "16:30 - 18:30", event: "Committee Session 2" },
      { time: "18:30 - 18:45", event: "Dispersal" },
    ],
  },
  {
    title: "DAY 2 - Saturday",
    rows: [
      { time: "08:00 - 08:30", event: "Registration/Chair Briefing" },
      { time: "08:30 - 10:00", event: "Committee Session 3" },
      { time: "10:00 - 10:30", event: "In-Committee Break" },
      { time: "10:30 - 12:00", event: "Committee Session 4" },
      { time: "12:00 - 13:00", event: "Lunch Break (food)" },
      { time: "13:00 - 14:45", event: "Committee Session 5" },
      { time: "14:45 - 15:00", event: "Break" },
      { time: "15:00 - 16:30", event: "Committee Session 6/Workshop" },
      { time: "16:30 - 18:00", event: "Commitee Session 6 /Workshop" },
      { time: "18:00 - 18:15", event: "Dispersal" },
      { time: "18:00 - 20:00", event: "Social Night" },
      { time: "20:00 - 20:15", event: "Post-Social Night Dispersal" },
    ],
  },
  {
    title: "DAY 3 - Sunday",
    rows: [
      { time: "08:00 - 08:30", event: "Registration/Chair Briefing" },
      { time: "08:30 - 10:00", event: "Committee Session 7" },
      { time: "10:00 - 10:30", event: "In-Committee Break" },
      { time: "10:30 - 12:00", event: "Committee Session 8" },
      { time: "12:00 - 13:00", event: "Lunch Break (food)" },
      { time: "13:00 - 14:30", event: "Committee Session 9" },
      { time: "14:30 - 16:00", event: "Closing Ceremony" },
      { time: "16:00 - 16:15", event: "Dispersal" },
    ],
  },
]

export function ScheduleSection() {
  return (
    <section id="schedule" className="py-12" style={{ backgroundColor: "#ffecdd" }}>
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <Card className="diplomatic-shadow border-0 bg-white/95">
            <CardHeader className="text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#B22222]/10">
                <Calendar className="h-6 w-6 text-[#B22222]" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-serif font-bold text-primary">Conference Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 px-2 pb-8 sm:px-6">
              {scheduleByDay.map((day) => (
                <div key={day.title} className="overflow-hidden rounded-md border border-[#555]/60">
                  <h3 className="bg-[#B22222] px-4 py-2 text-center text-2xl font-serif font-bold text-white">{day.title}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-[#f0f0f0]">
                          <th className="w-[32%] border border-[#999]/80 px-3 py-2 text-center text-xl font-serif font-bold">Time</th>
                          <th className="border border-[#999]/80 px-3 py-2 text-center text-xl font-serif font-bold">Event</th>
                        </tr>
                      </thead>
                      <tbody>
                        {day.rows.map((row) => (
                          <tr key={`${day.title}-${row.time}-${row.event}`}>
                            <td className="border border-[#999]/80 bg-[#f6f6f6] px-3 py-2 text-center text-xl font-serif font-semibold text-[#212121]">
                              {row.time}
                            </td>
                            <td className="border border-[#999]/80 bg-[#f9f5f5] px-3 py-2 text-center text-xl font-serif font-semibold text-[#212121]">
                              {row.event}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
