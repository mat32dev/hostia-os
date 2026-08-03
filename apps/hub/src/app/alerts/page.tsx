'use client';

import { useMemo, useState } from 'react';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { guardApi, useAlerts } from '@/lib/api';
import type { AlertStatus, GuardAlert } from '@/types';
import { cn } from '@/lib/utils';
import { AlertCard } from '@/components/AlertCard';
import { KPICard } from '@/components/KPICard';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardSkeletonGrid, EmptyState, ErrorState, LoadingState } from '@/components/ui/state';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

// ─── Resolve dialog ──────────────────────────────────────────────────────────
function ResolveAlertDialog({
  alert,
  onCancel,
  onResolved,
}: {
  alert: GuardAlert | null;
  onCancel: () => void;
  onResolved: () => Promise<void>;
}) {
  const [status, setStatus] = useState<AlertStatus>('resolved');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!alert || saving) return;
    setSaving(true);
    setError(null);
    try {
      await guardApi.resolveAlert(alert.id, { status, notes: notes.trim() || undefined });
      await onResolved();
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve the alert');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={alert !== null}
      onOpenChange={(open) => {
        if (!open) {
          setNotes('');
          setStatus('resolved');
          setError(null);
          onCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Resolve alert</DialogTitle>
          <DialogDescription>
            {alert?.title} — your verdict is sent back to Guard as feedback to improve future
            detections.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Verdict</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as AlertStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resolved">Resolved — confirmed incident</SelectItem>
                <SelectItem value="false_positive">False positive — nothing happened</SelectItem>
                <SelectItem value="investigating">Investigating — needs a closer look</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="resolution-notes">Notes</Label>
            <Textarea
              id="resolution-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What actually happened? (optional)"
              rows={3}
            />
          </div>
          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save verdict
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
type AlertsTab = 'open' | 'investigating' | 'resolved' | 'false_positive';

export default function AlertsPage() {
  // One fetch for stats, one filtered by the active tab.
  const allSwr = useAlerts('all', 12000);
  const [tab, setTab] = useState<AlertsTab>('open');
  const [resolving, setResolving] = useState<GuardAlert | null>(null);

  const all = useMemo(() => allSwr.data ?? [], [allSwr.data]);

  const counts = useMemo(
    () => ({
      open: all.filter((a) => a.status === 'open').length,
      investigating: all.filter((a) => a.status === 'investigating').length,
      resolved: all.filter((a) => a.status === 'resolved').length,
      false_positive: all.filter((a) => a.status === 'false_positive').length,
    }),
    [all],
  );

  const filtered = useMemo(() => all.filter((a) => a.status === tab), [all, tab]);
  const highOpen = all.filter(
    (a) => a.status === 'open' && (a.severity === 'high' || a.severity === 'critical'),
  ).length;
  const atRisk = all
    .filter((a) => a.status === 'open')
    .reduce((acc, a) => acc + (a.amount ?? 0), 0);

  const refresh = async () => {
    await allSwr.mutate();
  };

  if (allSwr.error) {
    return (
      <ErrorState
        title="Guard service unavailable"
        message={allSwr.error.message}
        onRetry={() => allSwr.mutate()}
      />
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      {allSwr.isLoading ? (
        <CardSkeletonGrid count={3} className="xl:grid-cols-3" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <KPICard
            title="Open alerts"
            value={String(counts.open)}
            icon={ShieldAlert}
            accent="rose"
            hint={highOpen > 0 ? `${highOpen} high/critical` : 'none urgent'}
          />
          <KPICard
            title="Cash at risk"
            value={new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(atRisk)}
            icon={ShieldAlert}
            accent="amber"
            hint="sum of open alert amounts"
          />
          <KPICard
            title="Resolved"
            value={String(counts.resolved)}
            icon={ShieldCheck}
            accent="emerald"
            hint={`${counts.false_positive} false positives`}
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as AlertsTab)}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="open">Open ({counts.open})</TabsTrigger>
          <TabsTrigger value="investigating">Investigating ({counts.investigating})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({counts.resolved})</TabsTrigger>
          <TabsTrigger value="false_positive">False positives ({counts.false_positive})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* List */}
      {allSwr.isLoading ? (
        <LoadingState label="Loading alerts…" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={tab === 'open' ? ShieldCheck : ShieldAlert}
          title={tab === 'open' ? 'No open alerts' : `No ${tab.replace('_', ' ')} alerts`}
          message={
            tab === 'open'
              ? 'Guard has not detected anything suspicious. Cash movements are being matched against POS sales.'
              : 'Alerts with this status will appear here.'
          }
        />
      ) : (
        <div className={cn('grid gap-3', filtered.length > 1 ? 'xl:grid-cols-2' : '')}>
          {filtered.map((alert) => (
            <AlertCard key={alert.id} alert={alert} onResolve={setResolving} />
          ))}
        </div>
      )}

      <ResolveAlertDialog
        alert={resolving}
        onCancel={() => setResolving(null)}
        onResolved={refresh}
      />
    </div>
  );
}
