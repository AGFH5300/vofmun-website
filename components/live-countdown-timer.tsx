"use client"

import { useState, useEffect } from "react"

export function LiveCountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const targetDate = new Date("2026-02-14T00:00:00").getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 text-center">
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 border border-white/20">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg" style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}>{timeLeft.days}</div>
        <div className="text-xs sm:text-sm text-white/90 drop-shadow">Days</div>
      </div>
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 border border-white/20">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg" style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}>{timeLeft.hours}</div>
        <div className="text-xs sm:text-sm text-white/90 drop-shadow">Hours</div>
      </div>
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 border border-white/20">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg" style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}>{timeLeft.minutes}</div>
        <div className="text-xs sm:text-sm text-white/90 drop-shadow">Minutes</div>
      </div>
      <div className="bg-black/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 md:p-4 border border-white/20">
        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg" style={{fontFamily: 'var(--font-dm-sans), sans-serif'}}>{timeLeft.seconds}</div>
        <div className="text-xs sm:text-sm text-white/90 drop-shadow">Seconds</div>
      </div>
    </div>
  )
}