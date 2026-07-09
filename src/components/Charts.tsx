import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const axis = { stroke: 'var(--muted)', fontSize: 11 }
const grid = 'var(--border-c)'

const tooltipStyle = {
  contentStyle: {
    background: 'var(--surface)',
    border: '1px solid var(--border-c)',
    borderRadius: 10,
    color: 'var(--text)',
    fontSize: 12,
  },
  labelStyle: { color: 'var(--muted)' },
}

interface SeriesProps {
  data: Array<Record<string, number | string>>
  xKey: string
  yKey: string
  height?: number
  unit?: string
}

export function TrendLine({ data, xKey, yKey, height = 180, unit }: SeriesProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit ?? ''}`, yKey]} />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke="var(--primary)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: 'var(--primary)' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function AreaTrend({ data, xKey, yKey, height = 180, unit }: SeriesProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit ?? ''}`, yKey]} />
        <Area
          type="monotone"
          dataKey={yKey}
          stroke="var(--primary)"
          strokeWidth={2.5}
          fill="url(#areaFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function BarTrend({ data, xKey, yKey, height = 180, unit }: SeriesProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
        <CartesianGrid stroke={grid} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey={xKey} tick={axis} tickLine={false} axisLine={false} />
        <YAxis tick={axis} tickLine={false} axisLine={false} width={40} />
        <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit ?? ''}`, yKey]} />
        <Bar dataKey={yKey} fill="var(--primary)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
