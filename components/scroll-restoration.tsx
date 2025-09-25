"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollRestoration() {
  const pathname = usePathname()

  useEffect(() => {
    // Handle hash navigation for resources page
    if (pathname === '/resources') {
      const hash = window.location.hash
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash.slice(1))
          if (element) {
            const offset = 120
            const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
            window.scrollTo({
              top: elementPosition - offset,
              behavior: 'smooth'
            })
          }
        }, 100)
      }
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}
