'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CATEGORIES, CATEGORY_KEYS } from '@ledgr/shared';
import { Icon, CATEGORY_ICON_CHOICES } from '@/components/ui/icon';
import { PaperCard, SectionLabel } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { useAddCategory, useCategories, useDeleteCategory } from '@/lib/queries';
import { cn } from '@/lib/cn';

const COLORS = [
  '#EF6C00', '#1565C0', '#7B1FA2', '#00838F', '#C62828', '#AD1457',
  '#2E7D32', '#546E7A', '#6D4C41', '#F9A825', '#0097A7', '#5E35B1',
];

export default function CategoriesPage() {
  const { data: custom = [] } = useCategories();
  const add = useAddCategory();
  const del = useDeleteCategory();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState(CATEGORY_ICON_CHOICES[0]!);
  const [color, setColor] = useState(COLORS[0]!);

  async function handleAdd() {
    if (!name.trim()) return;
    await add.mutateAsync({ name: name.trim(), icon, color });
    setName('');
    setIcon(CATEGORY_ICON_CHOICES[0]!);
    setColor(COLORS[0]!);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-semibold text-ink lg:hidden">Categories</h1>
        <Button className="ml-auto" size="sm" onClick={() => setOpen(true)}>
          <Plus size={16} /> New category
        </Button>
      </div>

      <SectionLabel>Built-in</SectionLabel>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {CATEGORY_KEYS.map((key) => {
          const def = CATEGORIES[key];
          return (
            <PaperCard key={key} className="flex items-center gap-3 p-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-sm"
                style={{ backgroundColor: `${def.color}24`, color: def.color }}
              >
                <Icon name={def.icon} size={18} />
              </span>
              <span className="font-medium text-ink">{def.displayName}</span>
            </PaperCard>
          );
        })}
      </div>

      {custom.length > 0 ? (
        <>
          <SectionLabel>Your categories</SectionLabel>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {custom.map((c) => (
              <PaperCard key={c.key} className="flex items-center gap-3 p-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-sm"
                  style={{ backgroundColor: `${c.color}24`, color: c.color }}
                >
                  <Icon name={c.icon} size={18} />
                </span>
                <span className="flex-1 truncate font-medium text-ink">{c.name}</span>
                <button
                  type="button"
                  aria-label={`Delete ${c.name}`}
                  onClick={() => del.mutate(c.key)}
                  className="rounded-sm p-1.5 text-ink-soft hover:text-negative"
                >
                  <Trash2 size={16} />
                </button>
              </PaperCard>
            ))}
          </div>
        </>
      ) : null}

      <ResponsiveDialog open={open} onOpenChange={setOpen} title="New category">
        <div className="flex flex-col gap-4">
          <Field label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Pets" />

          <div>
            <span className="mb-2 block text-sm font-medium text-ink-muted">Icon</span>
            <div className="grid max-h-40 grid-cols-6 gap-2 overflow-y-auto">
              {CATEGORY_ICON_CHOICES.map((choice) => (
                <button
                  key={choice}
                  type="button"
                  onClick={() => setIcon(choice)}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-sm border',
                    icon === choice ? 'border-terracotta bg-orange-pale text-terracotta' : 'border-stroke text-ink',
                  )}
                >
                  <Icon name={choice} size={18} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-ink-muted">Color</span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Color ${c}`}
                  onClick={() => setColor(c)}
                  className={cn('h-8 w-8 rounded-full', color === c && 'ring-2 ring-ink ring-offset-2 ring-offset-canvas')}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-card border border-stroke bg-paper p-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-sm"
              style={{ backgroundColor: `${color}24`, color }}
            >
              <Icon name={icon} size={20} />
            </span>
            <span className="font-medium text-ink">{name || 'Preview'}</span>
          </div>

          <Button disabled={!name.trim() || add.isPending} onClick={handleAdd}>
            Add category
          </Button>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
