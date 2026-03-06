"use client"

import dynamic from "next/dynamic"
import { useEffect, useMemo, useRef, type ReactNode } from "react"
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
  size: number
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
          size: Math.max(0.22, Math.min(0.8, delegates / 30)),
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

  const topCountries = points.slice(0, 6)

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
          <div className="mt-10 grid gap-8 xl:grid-cols-3">
            <GlobeVariantCard
              title="Variant A · Participating Countries"
              description="Rotating globe with luminous participation beacons sized by delegate count."
            >
              <AutoRotateGlobe
                width={420}
                height={320}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                pointsData={points}
                pointLat="lat"
                pointLng="lng"
                pointAltitude="size"
                pointColor={() => "#38bdf8"}
                pointRadius={0.36}
                pointsMerge
                labelsData={topCountries}
                labelLat="lat"
                labelLng="lng"
                labelText={(point: object) => {
                  const item = point as GlobePoint
                  return `${item.name} · ${item.delegates}`
                }}
                labelSize={1.4}
                labelDotRadius={0.28}
                labelColor={() => "#f8fafc"}
                labelResolution={2}
                atmosphereColor="#60a5fa"
                atmosphereAltitude={0.2}
                speed={0.45}
              />
            </GlobeVariantCard>

            <GlobeVariantCard
              title="Variant B · Diplomatic Corridors"
              description="Animated arcs from each participating country toward Dubai, representing international convergence."
            >
              <AutoRotateGlobe
                width={420}
                height={320}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                arcsData={arcData}
                arcColor={() => ["#22d3ee", "#a78bfa"]}
                arcStroke={0.55}
                arcAltitude={(arc: object) => Math.min(0.55, ((arc as { delegates: number }).delegates || 1) / 22)}
                arcDashLength={0.45}
                arcDashGap={0.35}
                arcDashAnimateTime={2200}
                pointsData={[{ ...DUBAI, size: 0.9 }]}
                pointLat="lat"
                pointLng="lng"
                pointAltitude="size"
                pointColor={() => "#f59e0b"}
                pointRadius={0.5}
                labelsData={[DUBAI]}
                labelLat="lat"
                labelLng="lng"
                labelText={(item: object) => (item as { name: string }).name}
                labelColor={() => "#fde68a"}
                labelSize={2}
                atmosphereColor="#818cf8"
                atmosphereAltitude={0.18}
                speed={0.3}
              />
            </GlobeVariantCard>

            <GlobeVariantCard
              title="Variant C · Pulse & Presence"
              description="Rings and glow pulses for each country to create a hero-grade, event-launch visual moment."
            >
              <AutoRotateGlobe
                width={420}
                height={320}
                backgroundColor="rgba(0,0,0,0)"
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                pointsData={points}
                pointLat="lat"
                pointLng="lng"
                pointAltitude={0.1}
                pointColor={() => "#a78bfa"}
                pointRadius={0.32}
                ringsData={points}
                ringLat="lat"
                ringLng="lng"
                ringColor={() => (t: number) => `rgba(56, 189, 248, ${1 - t})`}
                ringMaxRadius={(point: object) => Math.min(6, (point as GlobePoint).delegates * 0.22)}
                ringPropagationSpeed={1.2}
                ringRepeatPeriod={1000}
                atmosphereColor="#c084fc"
                atmosphereAltitude={0.22}
                speed={0.55}
              />
            </GlobeVariantCard>
          </div>
        )}

        <p className="mt-8 text-xs text-slate-400">Live data timestamp: {new Date(participation.lastUpdated).toLocaleString()}</p>
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
    <article className="rounded-2xl border border-slate-200/10 bg-slate-950/35 p-5 backdrop-blur-sm">
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-100/90">{title}</h2>
      <p className="mt-2 min-h-10 text-sm text-slate-300">{description}</p>
      <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-slate-900/40">{children}</div>
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
  }, [speed])

  return <Globe ref={globeRef} {...globeProps} />
}
