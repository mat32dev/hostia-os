'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { RestaurantTable } from '@/types';
import { ZONE_LABELS } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TableFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table?: RestaurantTable | null;
  onSubmit: (values: { number: number; capacity: number; zone: string }) => Promise<void>;
}

const ZONES = Object.keys(ZONE_LABELS);

export function TableFormDialog({ open, onOpenChange, table, onSubmit }: TableFormDialogProps) {
  const [number, setNumber] = useState(1);
  const [capacity, setCapacity] = useState(4);
  const [zone, setZone] = useState('salon');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (table) {
        setNumber(table.number);
        setCapacity(table.capacity);
        setZone(table.zone);
      } else {
        setNumber(1);
        setCapacity(4);
        setZone('salon');
      }
      setError(null);
    }
  }, [open, table]);

  const valid = number > 0 && capacity > 0;

  const handleSubmit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ number, capacity, zone });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the table');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{table ? `Edit Table #${table.number}` : 'New table'}</DialogTitle>
          <DialogDescription>
            {table
              ? 'Update the details of this table.'
              : 'Add a new table to your floor plan.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="tbl-number">Table number</Label>
              <Input
                id="tbl-number"
                type="number"
                min="1"
                value={number}
                onChange={(e) => setNumber(parseInt(e.target.value) || 1)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tbl-capacity">Seats</Label>
              <Input
                id="tbl-capacity"
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Zone</Label>
            <Select value={zone} onValueChange={setZone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ZONES.map((z) => (
                  <SelectItem key={z} value={z}>
                    {ZONE_LABELS[z]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!valid || saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {table ? 'Save changes' : 'Create table'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
