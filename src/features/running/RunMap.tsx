import { useEffect } from 'react'
import {
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  useMap,
} from 'react-leaflet'
import { latLngBounds } from 'leaflet'
import type { RunPoint } from '@/lib/types'

function FitBounds({ points }: { points: RunPoint[] }) {
  const map = useMap()
  useEffect(() => {
    if (points.length < 2) return
    const bounds = latLngBounds(points.map((p) => [p.lat, p.lng]))
    map.fitBounds(bounds, { padding: [24, 24] })
  }, [map, points])
  return null
}

function Recenter({ point }: { point: RunPoint }) {
  const map = useMap()
  useEffect(() => {
    map.setView([point.lat, point.lng], Math.max(map.getZoom(), 16))
  }, [map, point])
  return null
}

export function RunMap({
  points,
  follow = false,
  height = 260,
}: {
  points: RunPoint[]
  follow?: boolean
  height?: number
}) {
  const last = points[points.length - 1]
  const center: [number, number] = last
    ? [last.lat, last.lng]
    : [51.505, -0.09]
  const line = points.map((p) => [p.lat, p.lng]) as [number, number][]

  return (
    <div
      className="overflow-hidden rounded-xl border border-border-c"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {line.length > 1 && (
          <Polyline positions={line} pathOptions={{ color: '#6366f1', weight: 4 }} />
        )}
        {last && (
          <CircleMarker
            center={[last.lat, last.lng]}
            radius={7}
            pathOptions={{ color: '#fff', weight: 2, fillColor: '#6366f1', fillOpacity: 1 }}
          />
        )}
        {follow && last ? <Recenter point={last} /> : <FitBounds points={points} />}
      </MapContainer>
    </div>
  )
}
