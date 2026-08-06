'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { MenuCategory } from '@/types';
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

interface CategoryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: MenuCategory | null;
  onSubmit: (values: { name: string; sort_order: number }) => Promise<void>;
}

export function CategoryFormDialog({ open, onOpenChange, category, onSubmit }: CategoryFormDialogProps) {
  const [name, setName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (category) {
        setName(category.name);
        setSortOrder(category.sort_order);
      } else {
        setName('');
        setSortOrder(0);
      }
      setError(null);
    }
  }, [open, category]);

  const valid = name.trim().length > 0;

  const handleSubmit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: name.trim(), sort_order: sortOrder });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the category');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? `Edit "${category.name}"` : 'New category'}</DialogTitle>
          <DialogDescription>
            {category
              ? 'Update the category name and sort order.'
              : 'Add a new category to organize your menu items.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tapas, Drinks, Desserts"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cat-sort">Sort order</Label>
            <Input
              id="cat-sort"
              type="number"
              min="0"
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            />
            <p className="text-xs text-muted-foreground">Lower numbers appear first.</p>
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
            {category ? 'Save changes' : 'Create category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
