"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import worldCountries from "world-countries"
import { getCountryByCode } from "@/lib/countries"
import VofmunCleanGlobePreview from "@/components/test/vofmun-clean-globe-preview"

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false })

interface ParticipationPayload {
  counts: Record<string, number>
  totalDelegates: number
  totalNationalities: number
  unknownNationalities: number
  lastUpdated: string
}

interface Props {
  participation: ParticipationPayload
}

interface GlobePoint {
  lat: number
  lng: number
  code: string
  name: string
  delegates: number
  order: number
}

const DUBAI = {
  lat: 25.2048,
  lng: 55.2708,
  name: "Dubai",
}

const countryLatLng = new Map(
  worldCountries
    .filter((country) => country.cca2 && country.latlng?.length === 2)
    .map((country) => [country.cca2.toUpperCase(), country.latlng as [number, number]]),
)

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

export function PremiumParticipationGlobeShowcase({ participation }: Props) {
  const [activeCountry, setActiveCountry] = useState<GlobePoint | null>(null)

  const points = useMemo<GlobePoint[]>(() => {
    return Object.entries(participation.counts)
      .map(([code, delegates]) => {
        const center = countryLatLng.get(code)
        if (!center) {
          return null
        }

        const country = getCountryByCode(code)
        return {
          lat: center[0],
          lng: center[1],
          code,
          name: country?.name ?? code,
          delegates,
        }
      })
      .filter((value): value is Omit<GlobePoint, "order"> => value !== null)
      .sort((a, b) => b.delegates - a.delegates)
      .map((point, index) => ({
        ...point,
        order: index,
      }))
  }, [participation.counts])

  const arcData = useMemo(
    () =>
      points.map((point) => ({
        startLat: point.lat,
        startLng: point.lng,
        endLat: DUBAI.lat,
        endLng: DUBAI.lng,
        order: point.order,
        delegates: point.delegates,
        country: point.name,
      })),
    [points],
  )

  useEffect(() => {
    if (document.getElementById("vofmun-pin-style")) {
      return
    }

    const style = document.createElement("style")
    style.id = "vofmun-pin-style"
    style.textContent = `
      .vofmun-pin {
        position: relative;
        width: 34px;
        height: 34px;
        border-radius: 999px;
        background: radial-gradient(circle at 35% 30%, #ff7a86 0%, #be123c 55%, #7f1d1d 100%);
        border: 2px solid #fecdd3;
        box-shadow: 0 0 0 3px rgba(127, 29, 29, 0.35), 0 10px 24px rgba(127, 29, 29, 0.65);
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        transform: translate(-50%, -115%);
        cursor: pointer;
        user-select: none;
        pointer-events: auto;
      }

      .vofmun-pin::after {
        content: "";
        position: absolute;
        bottom: -10px;
        left: 50%;
        width: 11px;
        height: 11px;
        background: #7f1d1d;
        transform: translateX(-50%) rotate(45deg);
        border-right: 2px solid #fecdd3;
        border-bottom: 2px solid #fecdd3;
        border-bottom-right-radius: 3px;
      }
    `

    document.head.appendChild(style)
  }, [])

  const formattedLastUpdated = useMemo(
    () =>
      `${new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "medium",
        timeZone: "UTC",
      }).format(new Date(participation.lastUpdated))} UTC`,
    [participation.lastUpdated],
  )

  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
      <div className="rounded-3xl border border-sky-300/20 bg-gradient-to-br from-slate-950 via-[#070f23] to-[#180a2b] p-8 shadow-[0_20px_80px_rgba(0,0,0,0.55)] lg:p-12">
        <p className="text-xs uppercase tracking-[0.24em] text-sky-300/75">Experimental Route · Premium 3D Concept</p>
        <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight text-white lg:text-5xl">
          VOFMUN International Participation Globe
        </h1>
        <p className="mt-4 max-w-3xl text-base text-slate-300 lg:text-lg">
          A cinematic view of delegate origin countries converging on Dubai for VOFMUN. This route uses live Supabase
          nationality data and can be removed without touching production sections.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Delegates" value={formatNumber(participation.totalDelegates)} />
          <StatCard label="Participating Nationalities" value={formatNumber(participation.totalNationalities)} />
          <StatCard label="Countries Visualized" value={formatNumber(points.length)} />
          <StatCard label="Unknown / Unmapped Entries" value={formatNumber(participation.unknownNationalities)} />
        </div>

        {points.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-amber-300/25 bg-amber-400/10 p-6 text-amber-100">
            Could not render globe data yet because no valid country codes were found in the live participation dataset.
          </div>
        ) : (
          <div className="mt-10 flex flex-col gap-8">
            <GlobeVariantCard
              title="Variant A · Participating Countries"
              description="A rotating political-style globe with dark red pins for each participating country. Hover or tap a pin for country and delegate totals."
            >
              <AutoRotateGlobe
                width={1200}
                height={540}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                htmlElementsData={points}
                htmlLat="lat"
                htmlLng="lng"
                htmlAltitude={0.032}
                htmlElement={(point: object) => {
                  const item = point as GlobePoint
                  const pin = document.createElement("div")
                  pin.className = "vofmun-pin"
                  pin.innerHTML = `<span>${item.delegates}</span>`
                  pin.setAttribute("role", "button")
                  pin.setAttribute("aria-label", `${item.name}: ${formatNumber(item.delegates)} delegates`)
                  pin.onclick = () => setActiveCountry(item)
                  pin.onmouseenter = () => setActiveCountry(item)
                  pin.onmouseleave = () => setActiveCountry((current) => (current?.code === item.code ? null : current))
                  return pin
                }}
                atmosphereColor="#93c5fd"
                atmosphereAltitude={0.24}
                speed={0.28}
              />
              <p className="mt-4 text-center text-sm text-slate-300">
                {activeCountry
                  ? `${activeCountry.name} · ${formatNumber(activeCountry.delegates)} delegates`
                  : "Hover or click a red marker to inspect delegates by country."}
              </p>
            </GlobeVariantCard>

            <GlobeVariantCard
              title="Variant B · Diplomatic Corridors"
              description="Animated arcs from each participating country toward Dubai, representing international convergence."
            >
              <AutoRotateGlobe
                width={1200}
                height={540}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                arcsData={arcData}
                arcColor={() => ["#22d3ee", "#a78bfa"]}
                arcStroke={0.9}
                arcAltitude={(arc: object) => {
                  const delegates = (arc as { delegates: number }).delegates || 1
                  return Math.max(0.12, Math.min(0.5, delegates / 20))
                }}
                arcCurveResolution={80}
                arcDashLength={0.3}
                arcDashGap={1.9}
                arcDashInitialGap={(arc: object) => {
                  return ((arc as { order: number }).order ?? 0) * 0.45
                }}
                arcDashAnimateTime={4200}
                atmosphereColor="#818cf8"
                atmosphereAltitude={0.18}
                speed={0.2}
              />
            </GlobeVariantCard>

            <GlobeVariantCard
              title="Variant C · Clean SVG Frost Globe"
              description="High-fidelity SVG orthographic globe with clustering pins, country highlighting, drag controls, and adaptive tooltips."
            >
              <div className="h-[540px] w-full">
                <VofmunCleanGlobePreview />
              </div>
            </GlobeVariantCard>
          </div>
        )}
        <p className="mt-8 text-xs text-slate-400">Live data timestamp: {formattedLastUpdated}</p>
      </div>
    </section>
  )
}


function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}

function GlobeVariantCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <article className="w-full rounded-2xl border border-slate-200/10 bg-slate-950/35 p-6 backdrop-blur-sm lg:p-8">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-100/90">{title}</h2>
      <p className="mt-2 text-sm text-slate-300 lg:text-base">{description}</p>
      <div className="mt-5 flex justify-center overflow-hidden rounded-xl border border-white/10 bg-slate-900/40">{children}</div>
    </article>
  )
}

function AutoRotateGlobe(props: Record<string, unknown> & { speed?: number }) {
  const { speed = 0.45, ...globeProps } = props
  const globeRef = useRef<any>(null)

  useEffect(() => {
    const controls = globeRef.current?.controls?.()
    if (!controls) {
      return
    }

    controls.autoRotate = true
    controls.autoRotateSpeed = speed
    controls.enablePan = false
    controls.update()
  }, [speed])

  return <Globe ref={globeRef} {...globeProps} />
}
