"use client"

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { geoArea, geoDistance, geoOrthographic, geoPath } from "d3-geo"
import { feature, mesh } from "topojson-client"
import world from "world-atlas/countries-110m.json"
import worldCountries from "world-countries"
import { getCountryByCode } from "@/lib/countries"

export type PinLocation = {
  code: string
  name: string
  count: number
  lat: number
  lng: number
  countryId: string
}

type ProjectedPin = PinLocation & { x: number; y: number; visible: boolean }

type CountryPath = {
  id: string
  path: string
}

type PinCluster = {
  id: string
  pins: ProjectedPin[]
  x: number
  y: number
  totalCount: number
  primaryCountryId: string
}

const FROST = {
  land: "#9cb4c8",
  border: "rgba(248,250,252,0.72)",
  glow: "rgba(191,219,254,0.18)",
}

const FALLBACK_PIN_LOCATIONS: PinLocation[] = [
  { code: "IN", name: "India", count: 122, lat: 22.5937, lng: 78.9629, countryId: "356" },
  { code: "JO", name: "Jordan", count: 14, lat: 30.5852, lng: 36.2384, countryId: "400" },
  { code: "EG", name: "Egypt", count: 11, lat: 26.8206, lng: 30.8025, countryId: "818" },
  { code: "PK", name: "Pakistan", count: 6, lat: 30.3753, lng: 69.3451, countryId: "586" },
  { code: "SY", name: "Syria", count: 6, lat: 34.8021, lng: 38.9968, countryId: "760" },
  { code: "PS", name: "Palestine", count: 5, lat: 31.9522, lng: 35.2332, countryId: "275" },
  { code: "AE", name: "UAE", count: 4, lat: 24.4539, lng: 54.3773, countryId: "784" },
  { code: "PH", name: "Philippines", count: 4, lat: 12.8797, lng: 121.774, countryId: "608" },
  { code: "US", name: "United States", count: 4, lat: 39.8283, lng: -98.5795, countryId: "840" },
  { code: "BD", name: "Bangladesh", count: 3, lat: 23.685, lng: 90.3563, countryId: "050" },
  { code: "CA", name: "Canada", count: 3, lat: 56.1304, lng: -106.3468, countryId: "124" },
  { code: "AU", name: "Australia", count: 2, lat: -25.2744, lng: 133.7751, countryId: "036" },
  { code: "DM", name: "Dominica", count: 2, lat: 15.415, lng: -61.371, countryId: "212" },
  { code: "LB", name: "Lebanon", count: 2, lat: 33.8547, lng: 35.8623, countryId: "422" },
  { code: "NL", name: "Netherlands", count: 2, lat: 52.1326, lng: 5.2913, countryId: "528" },
  { code: "UA", name: "Ukraine", count: 2, lat: 48.3794, lng: 31.1656, countryId: "804" },
  { code: "AS", name: "American Samoa", count: 1, lat: -14.271, lng: -170.132, countryId: "016" },
  { code: "BE", name: "Belgium", count: 1, lat: 50.5039, lng: 4.4699, countryId: "056" },
  { code: "BG", name: "Bulgaria", count: 1, lat: 42.7339, lng: 25.4858, countryId: "100" },
  { code: "FR", name: "France", count: 1, lat: 46.2276, lng: 2.2137, countryId: "250" },
  { code: "GB", name: "United Kingdom", count: 1, lat: 55.3781, lng: -3.436, countryId: "826" },
  { code: "GM", name: "Gambia", count: 1, lat: 13.4432, lng: -15.3101, countryId: "270" },
  { code: "JM", name: "Jamaica", count: 1, lat: 18.1096, lng: -77.2975, countryId: "388" },
  { code: "KZ", name: "Kazakhstan", count: 1, lat: 48.0196, lng: 66.9237, countryId: "398" },
  { code: "LK", name: "Sri Lanka", count: 1, lat: 7.8731, lng: 80.7718, countryId: "144" },
  { code: "MA", name: "Morocco", count: 1, lat: 31.7917, lng: -7.0926, countryId: "504" },
  { code: "NZ", name: "New Zealand", count: 1, lat: -40.9006, lng: 174.886, countryId: "554" },
  { code: "PT", name: "Portugal", count: 1, lat: 39.3999, lng: -8.2245, countryId: "620" },
  { code: "RU", name: "Russia", count: 1, lat: 61.524, lng: 105.3188, countryId: "643" },
  { code: "TL", name: "Timor-Leste", count: 1, lat: -8.8742, lng: 125.7275, countryId: "626" },
  { code: "TM", name: "Turkmenistan", count: 1, lat: 38.9697, lng: 59.5563, countryId: "795" },
  { code: "TR", name: "Turkey", count: 1, lat: 38.9637, lng: 35.2433, countryId: "792" },
  { code: "UM", name: "US Minor Outlying Islands", count: 1, lat: 19.2823, lng: 166.647, countryId: "581" },
  { code: "ZA", name: "South Africa", count: 1, lat: -30.5595, lng: 22.9375, countryId: "710" },
]

type GlobeCountryMeta = {
  lat: number
  lng: number
  countryId: string
}

const countryMetaByCode = new Map<string, GlobeCountryMeta>(
  worldCountries
    .filter((country) => country.cca2 && country.latlng?.length === 2 && country.ccn3)
    .map((country) => [
      country.cca2.toUpperCase(),
      {
        lat: country.latlng[0],
        lng: country.latlng[1],
        countryId: country.ccn3,
      },
    ]),
)

const SVG_SIZE = 1600
const TINY_POLYGON_AREA = 0.000005
const CLUSTER_DISTANCE = 42
const DEFAULT_TILT = -14
const RESUME_DELAY_MS = 700
const AUTO_ROTATE_FRAME_MS = 120

const worldFeatureCollection = feature(world as any, (world as any).objects.countries) as any
const worldDisplayFeatures = (worldFeatureCollection.features ?? [])
  .map((country: any) => {
    const geometry = sanitizeGeometry(country.geometry)
    return geometry ? { ...country, geometry } : null
  })
  .filter(Boolean)

const worldLandFeatureCollection = {
  type: "FeatureCollection",
  features: worldDisplayFeatures,
} as any

const worldBordersMesh = mesh(world as any, (world as any).objects.countries, (a: any, b: any) => a !== b) as any

function buildPinLocations(counts: Record<string, number>): PinLocation[] {
  return Object.entries(counts)
    .map(([rawCode, count]) => {
      const code = rawCode.toUpperCase()
      const meta = countryMetaByCode.get(code)

      if (!meta || count <= 0) {
        return null
      }

      return {
        code,
        name: getCountryByCode(code)?.name ?? code,
        count,
        lat: meta.lat,
        lng: meta.lng,
        countryId: meta.countryId,
      }
    })
    .filter((location): location is PinLocation => location !== null)
}

function sanitizeGeometry(geometry: any): any | null {
  if (!geometry) return null

  if (geometry.type === "Polygon") {
    return geoArea({ type: "Polygon", coordinates: geometry.coordinates }) >= TINY_POLYGON_AREA
      ? geometry
      : null
  }

  if (geometry.type === "MultiPolygon") {
    const polygons = geometry.coordinates.filter(
      (coordinates: any) => geoArea({ type: "Polygon", coordinates }) >= TINY_POLYGON_AREA,
    )

    if (polygons.length === 0) return null
    if (polygons.length === 1) {
      return { type: "Polygon", coordinates: polygons[0] }
    }

    return { type: "MultiPolygon", coordinates: polygons }
  }

  return geometry
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function clusterPins(pins: ProjectedPin[]): PinCluster[] {
  const clusters: PinCluster[] = []

  for (const pin of pins) {
    const existing = clusters.find((cluster) => distance(cluster, pin) <= CLUSTER_DISTANCE)

    if (!existing) {
      clusters.push({
        id: pin.code,
        pins: [pin],
        x: pin.x,
        y: pin.y,
        totalCount: pin.count,
        primaryCountryId: pin.countryId,
      })
      continue
    }

    existing.pins.push(pin)
    existing.totalCount += pin.count
    existing.x = existing.pins.reduce((sum, item) => sum + item.x, 0) / existing.pins.length
    existing.y = existing.pins.reduce((sum, item) => sum + item.y, 0) / existing.pins.length
    existing.primaryCountryId = existing.pins.slice().sort((a, b) => b.count - a.count)[0].countryId
    existing.id = existing.pins.map((item) => item.code).join("-")
  }

  return clusters
}

function rectsOverlap(
  a: { left: number; right: number; top: number; bottom: number },
  b: { left: number; right: number; top: number; bottom: number },
) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top
}

function wrapTextToLines(text: string, maxCharsPerLine: number, maxLines: number) {
  const words = text.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return [text]
  }

  const lines: string[] = []
  let currentLine = ""
  let consumedWords = 0

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word

    if (candidate.length <= maxCharsPerLine || currentLine.length === 0) {
      currentLine = candidate
      consumedWords += 1
      continue
    }

    lines.push(currentLine)
    currentLine = word
    consumedWords += 1

    if (lines.length === maxLines - 1) {
      break
    }
  }

  const remainingWords = words.slice(consumedWords)
  const trailing = [currentLine, ...remainingWords].filter(Boolean).join(" ")

  if (trailing) {
    lines.push(trailing)
  }

  if (lines.length > maxLines) {
    return [...lines.slice(0, maxLines - 1), `${lines[maxLines - 1]}…`]
  }

  if (lines.length === maxLines && remainingWords.length > 0) {
    lines[maxLines - 1] = `${lines[maxLines - 1]}…`
  }

  return lines.slice(0, maxLines)
}

function getTooltipPlacement(cluster: PinCluster, clusters: PinCluster[]) {
  const singleClusterNameLines =
    cluster.pins.length === 1 ? wrapTextToLines(cluster.pins[0].name, 22, 3) : []

  const lines =
    cluster.pins.length === 1
      ? singleClusterNameLines.length + 1
      : Math.min(cluster.pins.length + 1, 6)
  const width = cluster.pins.length === 1 ? 540 : 620
  const height =
    cluster.pins.length === 1
      ? 60 + singleClusterNameLines.length * 46 + 48
      : 62 + lines * 34

  const candidates = [
    { tx: cluster.x, ty: cluster.y - 120 },
    { tx: cluster.x + 190, ty: cluster.y - 8 },
    { tx: cluster.x - 190, ty: cluster.y - 8 },
    { tx: cluster.x + 150, ty: cluster.y - 150 },
    { tx: cluster.x - 150, ty: cluster.y - 150 },
    { tx: cluster.x, ty: cluster.y + 210 },
    { tx: cluster.x + 220, ty: cluster.y + 120 },
    { tx: cluster.x - 220, ty: cluster.y + 120 },
  ]

  const hoveredRadius = cluster.pins.length > 1 ? 42 : 34
  const margin = 16

  const scored = candidates.map((candidate) => {
    const rectLeft = candidate.tx - width / 2
    const rectTop = candidate.ty - 68
    const rect = {
      left: rectLeft,
      right: rectLeft + width,
      top: rectTop,
      bottom: rectTop + height,
    }

    const paddedRect = {
      left: rect.left - margin,
      right: rect.right + margin,
      top: rect.top - margin,
      bottom: rect.bottom + margin,
    }

    const selfBounds = {
      left: cluster.x - hoveredRadius,
      right: cluster.x + hoveredRadius,
      top: cluster.y - hoveredRadius,
      bottom: cluster.y + hoveredRadius,
    }

    const coversSelf = rectsOverlap(paddedRect, selfBounds)

    const overlapsOtherPins = clusters.reduce((count, other) => {
      if (other.id === cluster.id) return count
      const pinRadius = other.pins.length > 1 ? 42 : 34
      const otherBounds = {
        left: other.x - pinRadius,
        right: other.x + pinRadius,
        top: other.y - pinRadius,
        bottom: other.y + pinRadius,
      }
      return rectsOverlap(paddedRect, otherBounds) ? count + 1 : count
    }, 0)

    const overflowX = Math.max(0, 10 - paddedRect.left) + Math.max(0, paddedRect.right - (SVG_SIZE - 10))
    const overflowY = Math.max(0, 10 - paddedRect.top) + Math.max(0, paddedRect.bottom - (SVG_SIZE - 10))

    const centerDistance = Math.hypot(candidate.tx - cluster.x, candidate.ty - cluster.y)

    return {
      ...candidate,
      width,
      height,
      coversSelf,
      overlapsOtherPins,
      overflowX,
      overflowY,
      centerDistance,
      score:
        (coversSelf ? 10000 : 0) +
        overlapsOtherPins * 1000 +
        overflowX * 20 +
        overflowY * 20 +
        centerDistance * 0.15,
    }
  })

  const best = scored.sort((a, b) => a.score - b.score)[0]

  return {
    tx: clamp(best.tx, best.width / 2 + 12, SVG_SIZE - best.width / 2 - 12),
    ty: clamp(best.ty, best.height + 12, SVG_SIZE - 12),
    rectX: -best.width / 2,
    rectY: -82,
    width: best.width,
    height: best.height,
  }
}

export default function VofmunCleanGlobePreview({
  counts,
}: {
  counts?: Record<string, number>
}) {
  const [rotation, setRotation] = useState(-18)
  const [tilt, setTilt] = useState(DEFAULT_TILT)
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null)
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null)
  const [pauseUntil, setPauseUntil] = useState(0)
  const hoveredClusterRef = useRef<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef({ active: false, lastX: 0, lastY: 0 })
  const animationFrameRef = useRef<number | null>(null)
  const lastTickRef = useRef<number | null>(null)
  const lastRenderRef = useRef<number | null>(null)

  useEffect(() => {
    hoveredClusterRef.current = hoveredClusterId
  }, [hoveredClusterId])

  useEffect(() => {
    const tick = (timestamp: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = timestamp
      }

      const deltaMs = Math.min(timestamp - lastTickRef.current, 64)
      lastTickRef.current = timestamp

      const elapsedSinceRender =
        lastRenderRef.current === null ? AUTO_ROTATE_FRAME_MS : timestamp - lastRenderRef.current

      if (
        elapsedSinceRender >= AUTO_ROTATE_FRAME_MS &&
        !dragRef.current.active &&
        !hoveredClusterRef.current &&
        Date.now() >= pauseUntil
      ) {
        lastRenderRef.current = timestamp
        setRotation((prev) => (prev - elapsedSinceRender * 0.007) % 360)
        setTilt((prev) => {
          const delta = DEFAULT_TILT - prev
          if (Math.abs(delta) < 0.04) return DEFAULT_TILT
          return prev + delta * Math.min(elapsedSinceRender / 560, 0.12)
        })
      }

      animationFrameRef.current = window.requestAnimationFrame(tick)
    }

    animationFrameRef.current = window.requestAnimationFrame(tick)

    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current)
      }
      animationFrameRef.current = null
      lastTickRef.current = null
      lastRenderRef.current = null
    }
  }, [pauseUntil])

  const pinLocations = useMemo(
    () => (counts ? buildPinLocations(counts) : FALLBACK_PIN_LOCATIONS),
    [counts],
  )

  const globeData = useMemo(() => {
    const projection = geoOrthographic().scale(760).translate([800, 800]).rotate([rotation, tilt, 0]).clipAngle(90)

    const path = geoPath(projection)

    const displayCountryPaths: CountryPath[] = worldDisplayFeatures
      .map((country: any) => ({
        id: String(country.id),
        path: path(country) || "",
      }))
      .filter((country: CountryPath) => Boolean(country.path))

    const borders = path(worldBordersMesh) || ""

    const land = path(worldLandFeatureCollection) || ""

    const pins = pinLocations.map((location) => {
      const point = projection([location.lng, location.lat])
      const center: [number, number] = [-rotation, -tilt]
      const visible = geoDistance([location.lng, location.lat], center) <= Math.PI / 2 - 0.01

      return point
        ? {
            ...location,
            x: point[0],
            y: point[1],
            visible,
          }
        : null
    }).filter((item): item is ProjectedPin => item !== null && item.visible)

    const clusters = clusterPins(pins)

    return {
      sphere: path({ type: "Sphere" }) || "",
      land,
      borders,
      countryPaths: displayCountryPaths,
      clusters,
    }
  }, [pinLocations, rotation, tilt])

  const hoveredCluster = useMemo(
    () => globeData.clusters.find((cluster) => cluster.id === hoveredClusterId) ?? null,
    [globeData.clusters, hoveredClusterId],
  )
  const selectedCluster = useMemo(
    () => globeData.clusters.find((cluster) => cluster.id === selectedClusterId) ?? null,
    [globeData.clusters, selectedClusterId],
  )
  const activeCluster = hoveredCluster ?? selectedCluster
  const activeCountryIds = new Set(activeCluster?.pins.map((pin) => pin.countryId) ?? [])
  const tooltipPlacement = activeCluster ? getTooltipPlacement(activeCluster, globeData.clusters) : null
  const singleClusterNameLines =
    activeCluster?.pins.length === 1 ? wrapTextToLines(activeCluster.pins[0].name, 22, 3) : []

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    setSelectedClusterId(null)
    dragRef.current = {
      active: true,
      lastX: event.clientX,
      lastY: event.clientY,
    }
    setIsDragging(true)
    setHoveredClusterId(null)
    setPauseUntil(Date.now() + RESUME_DELAY_MS)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragRef.current.active) return

    const dx = event.clientX - dragRef.current.lastX
    const dy = event.clientY - dragRef.current.lastY

    dragRef.current.lastX = event.clientX
    dragRef.current.lastY = event.clientY

    setRotation((prev) => prev + dx * 0.35)
    setTilt((prev) => clamp(prev - dy * 0.25, -55, 55))
    setPauseUntil(Date.now() + RESUME_DELAY_MS)
  }

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragRef.current.active = false
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.04),transparent_22%),linear-gradient(180deg,#020617,#030712_44%,#020617)] p-0 text-white">
      <div className="flex h-full w-full items-center justify-center">
        <svg
          viewBox="0 0 1600 1600"
          className={`h-full w-full max-w-none select-none ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <defs>
            <radialGradient id="ocean" cx="34%" cy="26%" r="82%">
              <stop offset="0%" stopColor="#374151" />
              <stop offset="24%" stopColor="#1f2937" />
              <stop offset="62%" stopColor="#111827" />
              <stop offset="100%" stopColor="#030712" />
            </radialGradient>

            <radialGradient id="rimGlow" cx="50%" cy="50%" r="50%">
              <stop offset="76%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor={FROST.glow} />
            </radialGradient>

            <radialGradient id="light" cx="28%" cy="24%" r="34%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </radialGradient>

            <filter id="softGlow">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="pinShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="2.4" floodColor="rgba(0,0,0,0.45)" />
            </filter>

            <filter id="tooltipShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.35)" />
            </filter>
          </defs>

          <path d={globeData.sphere} fill="url(#ocean)" />
          <path d={globeData.sphere} fill="url(#rimGlow)" />
          <path d={globeData.sphere} fill="url(#light)" />

          <path d={globeData.land} fill={FROST.land} stroke="none" />

          <path d={globeData.borders} fill="none" stroke={FROST.border} strokeWidth="1.18" filter="url(#softGlow)" />

          {globeData.countryPaths
            .filter((country) => activeCountryIds.has(country.id))
            .map((country) => (
              <g key={`active-${country.id}`}>
                <path d={country.path} fill="#8f2230" fillOpacity="0.92" stroke="none" />
                <path
                  d={country.path}
                  fill="none"
                  stroke="rgba(255,245,245,0.78)"
                  strokeWidth="1.05"
                  filter="url(#softGlow)"
                />
              </g>
            ))}

          {globeData.clusters.map((cluster) => {
            const isGroup = cluster.pins.length > 1
            return (
              <g
                key={cluster.id}
                transform={`translate(${cluster.x}, ${cluster.y})`}
                filter="url(#pinShadow)"
                className="cursor-pointer"
                onMouseEnter={() => {
                  if (dragRef.current.active) return
                  setHoveredClusterId(cluster.id)
                }}
                onMouseLeave={() => {
                  setHoveredClusterId((current) => (current === cluster.id ? null : current))
                  setPauseUntil(Date.now() + RESUME_DELAY_MS)
                }}
                onClick={(event) => {
                  event.stopPropagation()
                  setSelectedClusterId((current) => (current === cluster.id ? null : cluster.id))
                  setPauseUntil(Date.now() + RESUME_DELAY_MS)
                }}
              >
                <path
                  d={
                    isGroup
                      ? "M 0 -34 C 18 -34 32 -20 32 -5 C 32 9 18.4 20.8 9 31.6 L 0 42 L -9 31.6 C -18.4 20.8 -32 9 -32 -5 C -32 -20 -18 -34 0 -34 Z"
                      : "M 0 -28 C 14.5 -28 26 -16 26 -4 C 26 7.5 15.2 17.2 7.4 26.2 L 0 35 L -7.4 26.2 C -15.2 17.2 -26 7.5 -26 -4 C -26 -16 -14.5 -28 0 -28 Z"
                  }
                  fill="#5f0f14"
                  stroke="rgba(255,255,255,0.24)"
                  strokeWidth="0.85"
                />
                <circle cx="0" cy={isGroup ? "-5" : "-4"} r={isGroup ? "19" : "15.5"} fill="#7f1d1d" />
                <text
                  x="0"
                  y={isGroup ? "1" : "0.2"}
                  style={{ userSelect: "none", WebkitUserSelect: "none" }}
                  textAnchor="middle"
                  fontSize={isGroup ? "24" : "26"}
                  fontWeight="900"
                  fill="white"
                  stroke="rgba(20,20,20,0.35)"
                  strokeWidth="1.1"
                  paintOrder="stroke"
                  letterSpacing="0.15"
                  pointerEvents="none"
                >
                  {cluster.totalCount}
                </text>
              </g>
            )
          })}

          {activeCluster && tooltipPlacement && (
            <g
              transform={`translate(${tooltipPlacement.tx}, ${tooltipPlacement.ty})`}
              pointerEvents="none"
              filter="url(#tooltipShadow)"
            >
              <rect
                x={tooltipPlacement.rectX}
                y={tooltipPlacement.rectY}
                rx="18"
                width={tooltipPlacement.width}
                height={tooltipPlacement.height}
                fill="rgba(3,7,18,0.92)"
                stroke="rgba(255,255,255,0.12)"
              />
              {activeCluster.pins.length === 1 ? (
                <>
                  {singleClusterNameLines.map((line, index) => (
                    <text
                      key={`${line}-${index}`}
                      x="0"
                      y={tooltipPlacement.rectY + 42 + index * 42}
                      style={{ userSelect: "none", WebkitUserSelect: "none" }}
                      textAnchor="middle"
                      fontSize="38"
                      fontWeight="800"
                      fill="white"
                      stroke="rgba(2,6,23,0.9)"
                      strokeWidth="1.15"
                      paintOrder="stroke"
                    >
                      {line}
                    </text>
                  ))}
                  <text
                    x="0"
                    y={tooltipPlacement.rectY + 42 + singleClusterNameLines.length * 42 + 28}
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                    textAnchor="middle"
                    fontSize="28"
                    fontWeight="650"
                    fill="rgba(255,255,255,0.88)"
                    stroke="rgba(2,6,23,0.8)"
                    strokeWidth="0.85"
                    paintOrder="stroke"
                  >
                    {activeCluster.pins[0].count} participants
                  </text>
                </>
              ) : (
                <>
                  <text
                    x="0"
                    y="-36"
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                    textAnchor="middle"
                    fontSize="34"
                    fontWeight="800"
                    fill="white"
                    stroke="rgba(2,6,23,0.9)"
                    strokeWidth="1"
                    paintOrder="stroke"
                  >
                    {activeCluster.pins.length} countries · {activeCluster.totalCount} participants
                  </text>
                  {activeCluster.pins
                    .slice()
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((pin, index) => (
                      <text
                        key={pin.code}
                        x="0"
                        y={2 + index * 32}
                        style={{ userSelect: "none", WebkitUserSelect: "none" }}
                        textAnchor="middle"
                        fontSize="24"
                        fontWeight="600"
                        fill="rgba(255,255,255,0.9)"
                        stroke="rgba(2,6,23,0.8)"
                        strokeWidth="0.75"
                        paintOrder="stroke"
                      >
                        {pin.name} · {pin.count}
                      </text>
                    ))}
                </>
              )}
            </g>
          )}

          <path d={globeData.sphere} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.35" />
        </svg>
      </div>
    </div>
  )
}
