import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type KpiAccent = 'amber' | 'emerald' | 'rose' | 'sky' | 'violet';

const ACCENT_CLASSES: Record<KpiAccent, string> = {
  amber: 'bg-amber-500/15 text-amber-400',
  emerald: 'bg-emerald-500/15 text-emerald-400',
  rose: 'bg-rose-500/15 text-rose-400',
  sky: 'bg-sky-500/15 text-sky-400',
  violet: 'bg-violet-500/15 text-violet-400',
};

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  /** Percentage change vs. the previous period, e.g. 12.5 or -4.2 */
  delta?: number | null;
  deltaLabel?: string;
  hint?: string;
  accent?: KpiAccent;
  loading?: boolean;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  delta,
  deltaLabel = 'vs yesterday',
  hint,
  accent = 'amber',
  loading = false,
}: KPICardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const trend = delta === null || delta === undefined ? 'neutral' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';

  return (
    <Card className="transition-colors hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{title}</p>
            <p className="mt-1.5 truncate text-2xl font-bold tabular-nums">{value}</p>
            <div className="mt-1.5 flex items-center gap-1.5 text-xs">
              {trend !== 'neutral' && delta !== null && delta !== undefined && (
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 font-medium',
                    trend === 'up' ? 'text-emerald-400' : 'text-rose-400',
                  )}
                >
                  {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(delta).toFixed(1)}%
                </span>
              )}
              {delta !== null && delta !== undefined && trend === 'neutral' && (
                <span className="text-muted-foreground">0%</span>
              )}
              {(delta !== undefined) && <span className="text-muted-foreground">{deltaLabel}</span>}
              {hint && <span className="truncate text-muted-foreground">{hint}</span>}
            </div>
          </div>
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', ACCENT_CLASSES[accent])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
