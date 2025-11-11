"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"

export function CountdownSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    // Set conference date (you can adjust this date)
    const conferenceDate = new Date("2026-02-14T09:00:00")

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = conferenceDate.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12 px-4 sm:px-0">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-primary">Conference Countdown</h2>
            <p className="text-base sm:text-lg text-foreground/80 max-w-3xl mx-auto">
              Join us for an unforgettable diplomatic experience that will shape the future of international relations.
            </p>
          </div>

          {/* Countdown Timer */}
          <Card className="vofmun-gradient text-primary-foreground mb-8 diplomatic-shadow border-0">
            <CardContent className="p-4 sm:p-6 md:p-8">
              <div className="text-center space-y-4 sm:space-y-6">
                <h3 className="text-xl sm:text-2xl font-serif font-bold">Conference begins in</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{fontFamily: 'Garet, sans-serif'}}>{timeLeft.days}</div>
                    <div className="text-xs sm:text-sm opacity-80">Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{fontFamily: 'Garet, sans-serif'}}>{timeLeft.hours}</div>
                    <div className="text-xs sm:text-sm opacity-80">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{fontFamily: 'Garet, sans-serif'}}>{timeLeft.minutes}</div>
                    <div className="text-xs sm:text-sm opacity-80">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{fontFamily: 'Garet, sans-serif'}}>{timeLeft.seconds}</div>
                    <div className="text-xs sm:text-sm opacity-80">Seconds</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conference Details */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
            <Card className="hover-lift diplomatic-shadow border-0">
              <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-full w-fit mx-auto">
                  <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-primary">Date</h3>
                  <p className="text-sm sm:text-base text-foreground/70">February 14-15, 2026</p>
                </div>
              </CardContent>
            </Card>

            <Card className="hover-lift diplomatic-shadow border-0">
              <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
                <div className="p-2 sm:p-3 bg-accent/10 rounded-full w-fit mx-auto">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-serif font-semibold text-primary">Duration</h3>
                  <p className="text-sm sm:text-base text-foreground/70">2 Full Days</p>
                </div>
              </CardContent>
            </Card>

              <Card className="hover-lift diplomatic-shadow border-0 sm:col-span-2 md:col-span-1">
                <CardContent className="p-4 sm:p-6 text-center space-y-3 sm:space-y-4">
                  <div className="p-2 sm:p-3 bg-secondary/10 rounded-full w-fit mx-auto">
                    <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-secondary" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-serif font-semibold text-primary">Venue</h3>
                    <p className="text-sm sm:text-base text-foreground/70">
                      United Kingdom College of Business & Computing – Dubai Campus
                    </p>
                    <p className="text-xs sm:text-sm text-foreground/60">Academic City, Dubai</p>
                    <a
                      href="https://maps.app.goo.gl/jx4SsR7r58oauhedA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </CardContent>
              </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
