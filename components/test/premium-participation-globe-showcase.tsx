"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import worldCountries from "world-countries"
import { getCountryByCode } from "@/lib/countries"

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
      .filter((value): value is GlobePoint => value !== null)
      .sort((a, b) => b.delegates - a.delegates)
  }, [participation.counts])

  const arcData = useMemo(
    () =>
      points.map((point) => ({
        startLat: point.lat,
        startLng: point.lng,
        endLat: DUBAI.lat,
        endLng: DUBAI.lng,
        delegates: point.delegates,
        country: point.name,
      })),
    [points],
  )

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
                pointsData={points}
                pointLat="lat"
                pointLng="lng"
                pointAltitude={0.018}
                pointRadius={0.42}
                pointColor={() => "#8f0410"}
                pointLabel={(point: object) => {
                  const item = point as GlobePoint
                  return `<div style=\"padding:6px 8px; background:rgba(15,23,42,0.92); border:1px solid rgba(147,197,253,0.5); border-radius:8px; color:#e2e8f0;\">${item.name}<br /><strong>${formatNumber(item.delegates)} delegates</strong></div>`
                }}
                onPointHover={(point: object | null) => {
                  setActiveCountry((point as GlobePoint | null) ?? null)
                }}
                onPointClick={(point: object) => {
                  setActiveCountry(point as GlobePoint)
                }}
                atmosphereColor="#93c5fd"
                atmosphereAltitude={0.24}
                speed={1.2}
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
                arcDashLength={0.78}
                arcDashGap={1.4}
                arcDashAnimateTime={2200}
                atmosphereColor="#818cf8"
                atmosphereAltitude={0.18}
                speed={0.3}
              />
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
