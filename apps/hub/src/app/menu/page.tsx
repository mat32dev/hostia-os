'use client';

import { useMemo, useState } from 'react';
import { FolderOpen, Leaf, Loader2, Pencil, Plus, Search, Trash2, UtensilsCrossed, WheatOff } from 'lucide-react';
import { posApi, useMenu } from '@/lib/api';
import type { MenuCategory, MenuItem, MenuItemCreate, MenuItemUpdate } from '@/types';
import { cn, formatCurrency, groupBy } from '@/lib/utils';
import { CategoryFormDialog } from '@/components/CategoryFormDialog';
import { MenuEditor, type MenuItemFormValues } from '@/components/MenuEditor';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state';
import { Switch } from '@/components/ui/switch';

const UNCATEGORIZED = '__uncategorized__';

function DietaryBadges({ item }: { item: MenuItem }) {
  return (
    <span className="inline-flex items-center gap-1">
      {item.is_vegan && (
        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
          <Leaf className="mr-0.5 h-3 w-3" /> Vegan
        </Badge>
      )}
      {item.is_vegetarian && !item.is_vegan && (
        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
          <Leaf className="mr-0.5 h-3 w-3" /> Veg
        </Badge>
      )}
      {item.is_gluten_free && (
        <Badge variant="outline" className="border-sky-500/40 bg-sky-500/10 text-sky-400">
          <WheatOff className="mr-0.5 h-3 w-3" /> GF
        </Badge>
      )}
    </span>
  );
}

export default function MenuPage() {
  const menuSwr = useMenu();
  const [search, setSearch] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Category management
  const [catFormOpen, setCatFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);

  const categories = useMemo(() => menuSwr.data?.categories ?? [], [menuSwr.data]);
  const items = useMemo(() => menuSwr.data?.items ?? [], [menuSwr.data]);

  const categoryName = (id: number | null): string =>
    categories.find((c) => c.id === id)?.name ?? 'Uncategorized';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q) ||
        categoryName(i.category_id).toLowerCase().includes(q),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, search, categories]);

  const grouped = useMemo(() => {
    const byCategory = groupBy(filtered, (i) =>
      i.category_id !== null ? String(i.category_id) : UNCATEGORIZED,
    );
    const orderedKeys = [
      ...[...categories]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((c) => String(c.id))
        .filter((k) => byCategory[k]),
      ...(byCategory[UNCATEGORIZED] ? [UNCATEGORIZED] : []),
    ];
    return orderedKeys.map((key) => ({
      key,
      name: key === UNCATEGORIZED ? 'Uncategorized' : categoryName(Number(key)),
      category: key === UNCATEGORIZED ? null : categories.find((c) => c.id === Number(key)),
      items: byCategory[key],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, categories]);

  const notify = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  // Menu item handlers
  const handleSubmit = async (values: MenuItemFormValues) => {
    const base: MenuItemCreate = {
      name: values.name.trim(),
      description: values.description.trim() || null,
      price: values.price,
      cost: values.cost,
      allergens: values.allergens.trim() || null,
      is_vegetarian: values.is_vegetarian,
      is_vegan: values.is_vegan,
      is_gluten_free: values.is_gluten_free,
      category_id: values.category_id,
    };
    if (editing) {
      const update: MenuItemUpdate = { ...base, is_available: values.is_available };
      await posApi.updateMenuItem(editing.id, update);
      notify('success', `"${values.name}" updated.`);
    } else {
      await posApi.createMenuItem(base);
      notify('success', `"${values.name}" added to the menu.`);
    }
    await menuSwr.mutate();
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    setTogglingId(item.id);
    try {
      await posApi.updateMenuItem(item.id, { is_available: !item.is_available });
      await menuSwr.mutate();
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to update availability');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (item: MenuItem) => {
    setDeletingId(item.id);
    try {
      await posApi.deleteMenuItem(item.id);
      await menuSwr.mutate();
      notify('success', `"${item.name}" removed from the menu.`);
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to delete the item');
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  // Category handlers
  const handleCategorySubmit = async (values: { name: string; sort_order: number }) => {
    if (editingCategory) {
      await posApi.updateCategory(editingCategory.id, values);
      notify('success', `Category "${values.name}" updated.`);
    } else {
      await posApi.createCategory(values);
      notify('success', `Category "${values.name}" created.`);
    }
    await menuSwr.mutate();
  };

  const handleDeleteCategory = async (cat: MenuCategory) => {
    setDeletingCategoryId(cat.id);
    try {
      await posApi.deleteCategory(cat.id);
      await menuSwr.mutate();
      notify('success', `Category "${cat.name}" deleted. Items moved to Uncategorized.`);
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to delete category');
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleEditCategory = (cat: MenuCategory) => {
    setEditingCategory(cat);
    setCatFormOpen(true);
  };

  const handleCatFormOpenChange = (open: boolean) => {
    setCatFormOpen(open);
    if (!open) setEditingCategory(null);
  };

  if (menuSwr.error) {
    return <ErrorState message={menuSwr.error.message} onRetry={() => menuSwr.mutate()} />;
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes…"
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCatFormOpen(true)}>
            <FolderOpen className="h-4 w-4" /> Category
          </Button>
          <Button
            onClick={() => {
              setEditing(null);
              setEditorOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New item
          </Button>
        </div>
      </div>

      {feedback && (
        <p
          className={cn(
            'rounded-lg border px-3 py-2 text-sm',
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300',
          )}
        >
          {feedback.message}
        </p>
      )}

      {menuSwr.isLoading ? (
        <LoadingState label="Loading menu…" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={UtensilsCrossed}
          title="Your menu is empty"
          message="Add your first dish or drink. The AI waiter uses this menu to answer WhatsApp customers."
          action={
            <Button size="sm" onClick={() => setEditorOpen(true)}>
              <Plus className="h-4 w-4" /> New item
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title="No matches" message={`Nothing found for "${search}".`} />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <section key={group.key}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.name}
                  <span className="ml-2 font-normal normal-case">({group.items.length})</span>
                </h3>
                {group.category && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleEditCategory(group.category!)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    {deletingCategoryId === group.category!.id ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleDeleteCategory(group.category!)}
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-rose-400"
                        onClick={() => handleDeleteCategory(group.category!)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => {
                  const margin = item.price > 0 ? ((item.price - item.cost) / item.price) * 100 : 0;
                  return (
                    <Card
                      key={item.id}
                      className={cn(
                        'transition-colors hover:border-primary/30',
                        !item.is_available && 'opacity-60',
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{item.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-1">
                              <DietaryBadges item={item} />
                              {item.allergens && (
                                <span className="text-xs text-muted-foreground">
                                  Allergens: {item.allergens}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="shrink-0 text-lg font-bold tabular-nums text-primary">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        {item.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between border-t pt-3">
                          <div className="text-xs text-muted-foreground">
                            {item.cost > 0 ? (
                              <span>
                                Cost {formatCurrency(item.cost)} · Margin {margin.toFixed(0)}%
                              </span>
                            ) : (
                              <span>No cost set</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="mr-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                              {togglingId === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Switch
                                  checked={item.is_available}
                                  onCheckedChange={() => handleToggleAvailability(item)}
                                  aria-label="Toggle availability"
                                />
                              )}
                              {item.is_available ? 'Available' : 'Hidden'}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setEditing(item);
                                setEditorOpen(true);
                              }}
                              aria-label={`Edit ${item.name}`}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            {confirmDeleteId === item.id ? (
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8"
                                disabled={deletingId === item.id}
                                onClick={() => handleDelete(item)}
                              >
                                {deletingId === item.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  'Confirm'
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-rose-400"
                                onClick={() => setConfirmDeleteId(item.id)}
                                aria-label={`Delete ${item.name}`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <MenuEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        item={editing}
        categories={categories}
        onSubmit={handleSubmit}
      />

      <CategoryFormDialog
        open={catFormOpen}
        onOpenChange={handleCatFormOpenChange}
        category={editingCategory}
        onSubmit={handleCategorySubmit}
      />
    </div>
  );
}
