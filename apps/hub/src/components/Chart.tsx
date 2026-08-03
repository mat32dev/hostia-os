'use client';

import { useId } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export const CHART_COLORS = ['#f59e0b', '#38bdf8', '#34d399', '#a78bfa', '#fb7185', '#facc15'];

const AXIS_TICK = { fill: '#8b8b98', fontSize: 12 };
const GRID_STROKE = 'rgba(255,255,255,0.06)';

type ValueFormatter = (value: number) => string;

const defaultFormatter: ValueFormatter = (v) => v.toLocaleString();

function ChartTooltip({
  active,
  payload,
  label,
  formatter = defaultFormatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color?: string; payload?: Record<string, unknown> }>;
  label?: string;
  formatter?: ValueFormatter;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
      {label !== undefined && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color ?? CHART_COLORS[i % CHART_COLORS.length] }}
          />
          <span className="capitalize">{entry.name}:</span>
          <span className="font-semibold tabular-nums text-foreground">{formatter(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Area chart ──────────────────────────────────────────────────────────────
interface AreaChartWidgetProps<T extends object> {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  color?: string;
  height?: number;
  valueFormatter?: ValueFormatter;
}

export function AreaChartWidget<T extends object>({
  data,
  xKey,
  yKey,
  color = '#f59e0b',
  height = 260,
  valueFormatter,
}: AreaChartWidgetProps<T>) {
  const gradientId = useId();
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v))}
          />
          <Tooltip content={<ChartTooltip formatter={valueFormatter} />} cursor={{ stroke: 'rgba(255,255,255,0.15)' }} />
          <Area
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Bar chart ───────────────────────────────────────────────────────────────
interface BarChartWidgetProps<T extends object> {
  data: T[];
  xKey: keyof T & string;
  yKey: keyof T & string;
  color?: string;
  height?: number;
  /** Render horizontal bars (category axis on the left). */
  horizontal?: boolean;
  valueFormatter?: ValueFormatter;
}

export function BarChartWidget<T extends object>({
  data,
  xKey,
  yKey,
  color = '#38bdf8',
  height = 260,
  horizontal = false,
  valueFormatter,
}: BarChartWidgetProps<T>) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        {horizontal ? (
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 12, left: 8, bottom: 4 }}>
            <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
            <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ ...AXIS_TICK, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={110}
            />
            <Tooltip content={<ChartTooltip formatter={valueFormatter} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey={yKey} fill={color} radius={[0, 4, 4, 0]} maxBarSize={18} />
          </BarChart>
        ) : (
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRID_STROKE} vertical={false} />
            <XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={false} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
            <Tooltip content={<ChartTooltip formatter={valueFormatter} />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey={yKey} fill={color} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// ─── Pie chart ───────────────────────────────────────────────────────────────
interface PieChartWidgetProps<T extends object> {
  data: T[];
  nameKey: keyof T & string;
  valueKey: keyof T & string;
  height?: number;
  valueFormatter?: ValueFormatter;
}

export function PieChartWidget<T extends object>({
  data,
  nameKey,
  valueKey,
  height = 240,
  valueFormatter,
}: PieChartWidgetProps<T>) {
  const total = data.reduce((acc, d) => acc + Number(d[valueKey] ?? 0), 0);
  return (
    <div className="flex w-full flex-col items-center gap-4 sm:flex-row">
      <div style={{ height, minWidth: height }} className="shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip formatter={valueFormatter} />} />
            <Pie
              data={data}
              dataKey={valueKey}
              nameKey={nameKey}
              innerRadius="58%"
              outerRadius="88%"
              paddingAngle={3}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="w-full space-y-2">
        {data.map((d, i) => {
          const value = Number(d[valueKey] ?? 0);
          const pct = total > 0 ? (value / total) * 100 : 0;
          return (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
              />
              <span className="flex-1 truncate capitalize text-muted-foreground">{String(d[nameKey])}</span>
              <span className="font-medium tabular-nums">{pct.toFixed(0)}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
