'use client';

import { Camera, CheckCircle2, Euro, Video } from 'lucide-react';
import type { GuardAlert } from '@/types';
import {
  ALERT_SEVERITY_META,
  ALERT_STATUS_META,
  ALERT_TYPE_LABELS,
  formatCurrency,
  formatTime,
  timeAgo,
} from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  alert: GuardAlert;
  onResolve?: (alert: GuardAlert) => void;
}

export function AlertCard({ alert, onResolve }: AlertCardProps) {
  const severity = ALERT_SEVERITY_META[alert.severity] ?? ALERT_SEVERITY_META.medium;
  const status = ALERT_STATUS_META[alert.status] ?? ALERT_STATUS_META.open;
  const actionable = alert.status === 'open' || alert.status === 'investigating';

  return (
    <Card className={cn('border-l-4 transition-colors hover:border-primary/30', severity.border)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={severity.className}>
                {severity.label}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {ALERT_TYPE_LABELS[alert.type] ?? alert.type}
              </Badge>
              <Badge variant="outline" className={status.className}>
                {status.label}
              </Badge>
            </div>
            <p className="mt-2 font-semibold">{alert.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{alert.description}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span title={alert.timestamp}>{timeAgo(alert.timestamp || alert.created_at)} · {formatTime(alert.timestamp || alert.created_at)}</span>
          <span className="inline-flex items-center gap-1">
            <Camera className="h-3 w-3" />
            {alert.camera_id}
          </span>
          {alert.amount !== null && alert.amount !== undefined && (
            <span className="inline-flex items-center gap-1 font-medium text-amber-400">
              <Euro className="h-3 w-3" />
              {formatCurrency(alert.amount)}
            </span>
          )}
          {alert.table_number !== null && alert.table_number !== undefined && (
            <span>Table {alert.table_number}</span>
          )}
          {alert.video_url && (
            <a
              href={alert.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Video className="h-3 w-3" />
              Watch footage
            </a>
          )}
        </div>

        {alert.resolution_notes && (
          <p className="mt-3 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Resolution:</span> {alert.resolution_notes}
          </p>
        )}

        {actionable && onResolve && (
          <div className="mt-3 flex justify-end border-t pt-3">
            <Button variant="outline" size="sm" onClick={() => onResolve(alert)}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Resolve
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
