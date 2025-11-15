"use client"

import { useEffect } from "react"

export function ClientScripts() {
  useEffect(() => {
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")
    const carouselTrack = document.getElementById("carouselTrack")

    if (prevBtn && nextBtn && carouselTrack) {
      let currentIndex = 0
      const totalSlides = carouselTrack.children.length

      const updateCarousel = () => {
        const slideWidth = carouselTrack.children[0]?.getBoundingClientRect().width || 0
        carouselTrack.style.transform = `translateX(-${currentIndex * (slideWidth + 24)}px)`
      }

      prevBtn.addEventListener("click", () => {
        currentIndex = currentIndex > 0 ? currentIndex - 1 : totalSlides - 1
        updateCarousel()
      })

      nextBtn.addEventListener("click", () => {
        currentIndex = currentIndex < totalSlides - 1 ? currentIndex + 1 : 0
        updateCarousel()
      })

      // Auto-advance carousel
      const autoAdvance = setInterval(() => {
        currentIndex = currentIndex < totalSlides - 1 ? currentIndex + 1 : 0
        updateCarousel()
      }, 5000)

      return () => clearInterval(autoAdvance)
    }

    const delegateCounter = document.getElementById("delegate-counter")
    if (delegateCounter) {
      let count = 0
      const target = 250
      const increment = target / 100

      const updateCounter = () => {
        count += increment
        if (count < target) {
          delegateCounter.textContent = Math.floor(count).toString()
          requestAnimationFrame(updateCounter)
        } else {
          delegateCounter.textContent = "250+"
        }
      }

      // Start counter animation when element is in view
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            updateCounter()
            observer.unobserve(entry.target)
          }
        })
      })

      observer.observe(delegateCounter)
    }

    const navLinks = document.querySelectorAll('a[href^="#"]')
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault()
        const targetId = link.getAttribute("href")?.substring(1)
        const targetElement = document.getElementById(targetId || "")

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }
      })
    })

    const handleScroll = () => {
      const scrolled = window.pageYOffset
      const parallaxElements = document.querySelectorAll(".parallax-element")

      parallaxElements.forEach((element) => {
        const speed = 0.5
        const yPos = -(scrolled * speed)
        ;(element as HTMLElement).style.transform = `translateY(${yPos}px)`
      })
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return null
}
