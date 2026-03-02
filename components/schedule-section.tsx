// © 2026 Ansh Gupta. All rights reserved.
// Proprietary - NOT OPEN SOURCE. No copying/modification/deployment without permission (dxb.avg@gmail.com).

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock3 } from "lucide-react"

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

function getEventStyle(event: string) {
  const normalizedEvent = event.toLowerCase()

  if (normalizedEvent.includes("social")) {
    return {
      label: "Featured",
      ringColor: "ring-fuchsia-300/70",
      bgColor: "bg-fuchsia-50",
      badgeColor: "bg-fuchsia-100 text-fuchsia-700",
    }
  }

  if (normalizedEvent.includes("ceremony")) {
    return {
      label: "Highlight",
      ringColor: "ring-amber-300/70",
      bgColor: "bg-amber-50",
      badgeColor: "bg-amber-100 text-amber-700",
    }
  }

  if (normalizedEvent.includes("break") || normalizedEvent.includes("lunch")) {
    return {
      label: "Break",
      ringColor: "ring-lime-300/70",
      bgColor: "bg-lime-50",
      badgeColor: "bg-lime-100 text-lime-700",
    }
  }

  if (normalizedEvent.includes("committee") || normalizedEvent.includes("workshop")) {
    return {
      label: "Session",
      ringColor: "ring-blue-300/70",
      bgColor: "bg-blue-50",
      badgeColor: "bg-blue-100 text-blue-700",
    }
  }

  if (normalizedEvent.includes("registration") || normalizedEvent.includes("chair")) {
    return {
      label: "Arrival",
      ringColor: "ring-violet-300/70",
      bgColor: "bg-violet-50",
      badgeColor: "bg-violet-100 text-violet-700",
    }
  }

  return {
    label: "Update",
    ringColor: "ring-slate-300/70",
    bgColor: "bg-slate-50",
    badgeColor: "bg-slate-100 text-slate-700",
  }
}

export function ScheduleSection() {
  return (
    <section
      id="schedule"
      className="relative overflow-hidden py-14 sm:py-16"
    >
      <div className="pointer-events-none absolute -right-8 top-10 h-28 w-28 rounded-full bg-[#B22222]/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-10 bottom-16 h-32 w-32 rounded-full bg-amber-400/20 blur-3xl" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <Card className="diplomatic-shadow border-[#B22222]/10 bg-white/85 backdrop-blur-sm">
            <CardHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#B22222]/10">
                <Calendar className="h-7 w-7 text-[#B22222]" />
              </div>
              <CardTitle className="text-3xl font-bold text-primary sm:text-4xl">Conference Schedule</CardTitle>
              <p className="mx-auto max-w-2xl text-sm text-muted-foreground sm:text-base">
                A polished, easy-to-scan timeline for all three conference days.
              </p>
            </CardHeader>

            <CardContent className="space-y-6 px-3 pb-8 sm:px-6">
              {scheduleByDay.map((day, dayIndex) => (
                <div
                  key={day.title}
                  className="overflow-hidden rounded-2xl border border-[#B22222]/20 bg-white/70 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="bg-gradient-to-r from-[#B22222] to-[#8f1818] px-5 py-3">
                    <h3 className="text-center text-xl font-bold tracking-wide text-white sm:text-2xl">{day.title}</h3>
                  </div>

                  <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4 lg:grid-cols-3">
                    {day.rows.map((row, rowIndex) => {
                      const eventStyle = getEventStyle(row.event)

                      return (
                        <article
                          key={`${day.title}-${row.time}-${row.event}`}
                          className={`group rounded-xl border border-slate-200/80 p-3 shadow-sm ring-1 ${eventStyle.ringColor} ${eventStyle.bgColor} transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
                          style={{
                            animation: "fadeIn 0.5s ease-out both",
                            animationDelay: `${dayIndex * 0.08 + rowIndex * 0.03}s`,
                          }}
                        >
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${eventStyle.badgeColor}`}>
                              {eventStyle.label}
                            </span>
                            <Clock3 className="h-4 w-4 text-slate-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                          </div>

                          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-[#8f1818]">
                            <Clock3 className="h-4 w-4" />
                            {row.time}
                          </div>

                          <p className="text-sm font-medium text-slate-700">{row.event}</p>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ))}
              {/* <div className="grid gap-4 lg:grid-cols-3">
                {scheduleByDay.map((day) => (
                  <div
                    key={day.title}
                    className="overflow-hidden rounded-2xl border border-[#B22222]/20 bg-white/80 shadow-sm"
                  >
                    <div className="bg-gradient-to-r from-[#B22222] to-[#8f1818] px-4 py-3">
                      <h3 className="text-center text-lg font-bold tracking-wide text-white">{day.title}</h3>
                    </div>

                    <div className="space-y-2 p-3">
                      {day.rows.map((row) => {
                        const eventStyle = getEventStyle(row.event)

                        return (
                          <article
                            key={`${day.title}-${row.time}-${row.event}`}
                            className={`rounded-lg border border-slate-200/80 p-2.5 ring-1 ${eventStyle.ringColor} ${eventStyle.bgColor}`}
                          >
                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${eventStyle.badgeColor}`}>
                                {eventStyle.label}
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#8f1818]">
                                <Clock3 className="h-3.5 w-3.5" />
                                {row.time}
                              </span>
                            </div>

                            <p className="text-sm font-medium text-slate-700">{row.event}</p>
                          </article>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
