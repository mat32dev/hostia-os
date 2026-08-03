'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { MenuCategory, MenuItem } from '@/types';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export interface MenuItemFormValues {
  name: string;
  description: string;
  price: number;
  cost: number;
  category_id: number | null;
  allergens: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  is_available: boolean;
}

const EMPTY_VALUES: MenuItemFormValues = {
  name: '',
  description: '',
  price: 0,
  cost: 0,
  category_id: null,
  allergens: '',
  is_vegetarian: false,
  is_vegan: false,
  is_gluten_free: false,
  is_available: true,
};

function valuesFromItem(item: MenuItem | null | undefined): MenuItemFormValues {
  if (!item) return EMPTY_VALUES;
  return {
    name: item.name,
    description: item.description ?? '',
    price: item.price,
    cost: item.cost,
    category_id: item.category_id,
    allergens: item.allergens ?? '',
    is_vegetarian: item.is_vegetarian,
    is_vegan: item.is_vegan,
    is_gluten_free: item.is_gluten_free,
    is_available: item.is_available,
  };
}

interface MenuEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the editor works in "edit" mode; otherwise it creates a new item. */
  item?: MenuItem | null;
  categories: MenuCategory[];
  onSubmit: (values: MenuItemFormValues) => Promise<void>;
}

export function MenuEditor({ open, onOpenChange, item, categories, onSubmit }: MenuEditorProps) {
  const [values, setValues] = useState<MenuItemFormValues>(EMPTY_VALUES);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(valuesFromItem(item));
      setError(null);
    }
  }, [open, item]);

  const set = <K extends keyof MenuItemFormValues>(key: K, value: MenuItemFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const valid = values.name.trim().length > 0 && values.price > 0;

  const handleSubmit = async () => {
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save the item');
    } finally {
      setSaving(false);
    }
  };

  const margin = values.price > 0 ? ((values.price - values.cost) / values.price) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? `Edit “${item.name}”` : 'New menu item'}</DialogTitle>
          <DialogDescription>
            {item
              ? 'Update the details of this dish. Availability changes apply immediately.'
              : 'Add a new dish or drink to your menu.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="mi-name">Name</Label>
            <Input
              id="mi-name"
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Iberian ham croquettes"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mi-desc">Description</Label>
            <Textarea
              id="mi-desc"
              value={values.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Short description shown to customers…"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="mi-price">Price (€)</Label>
              <Input
                id="mi-price"
                type="number"
                min="0"
                step="0.10"
                value={values.price || ''}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                placeholder="8.50"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mi-cost">Cost (€)</Label>
              <Input
                id="mi-cost"
                type="number"
                min="0"
                step="0.10"
                value={values.cost || ''}
                onChange={(e) => set('cost', parseFloat(e.target.value) || 0)}
                placeholder="2.30"
              />
              {values.price > 0 && values.cost > 0 && (
                <p className="text-xs text-muted-foreground">Margin: {margin.toFixed(0)}%</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={values.category_id !== null ? String(values.category_id) : 'none'}
                onValueChange={(v) => set('category_id', v === 'none' ? null : Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mi-allergens">Allergens</Label>
              <Input
                id="mi-allergens"
                value={values.allergens}
                onChange={(e) => set('allergens', e.target.value)}
                placeholder="gluten, nuts, lactose"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-lg border p-3 sm:grid-cols-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={values.is_vegetarian} onCheckedChange={(v) => set('is_vegetarian', v)} />
              Vegetarian
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={values.is_vegan} onCheckedChange={(v) => set('is_vegan', v)} />
              Vegan
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={values.is_gluten_free} onCheckedChange={(v) => set('is_gluten_free', v)} />
              Gluten-free
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={values.is_available} onCheckedChange={(v) => set('is_available', v)} />
              Available
            </label>
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
            {item ? 'Save changes' : 'Create item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
