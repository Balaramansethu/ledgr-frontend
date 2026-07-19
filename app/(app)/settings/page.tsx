'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, LogOut, User } from 'lucide-react';
import { CURRENCIES, type ThemeMode, type UserDto } from '@ledgr/shared';
import { GroupedList, GroupedRow } from '@/components/ui/grouped-list';
import { PaperCard, SectionLabel, AvatarBubble } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Switch } from '@/components/ui/switch';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { api } from '@/lib/api';
import { useImportBackup } from '@/lib/queries';
import { ensurePushSubscription, removePushSubscription } from '@/lib/push';
import { cn } from '@/lib/cn';

async function download(path: string, filename: string) {
  const res = await fetch(`/api${path}`, { credentials: 'include' });
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const { setMode } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  const importBackup = useImportBackup();
  const fileRef = useRef<HTMLInputElement>(null);

  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  if (!user) return null;
  const s = user.settings;

  async function patch(input: Record<string, unknown>) {
    const { user: updated } = await api.patch<{ user: UserDto }>('/users/me', input);
    setUser(updated);
    return updated;
  }

  async function onToggleReminders(enabled: boolean) {
    if (enabled) {
      const ok = await ensurePushSubscription();
      if (!ok) {
        toast({ message: 'Enable notifications in your browser to get reminders.' });
        return;
      }
    } else {
      await removePushSubscription();
    }
    await patch({ reminderEnabled: enabled });
  }

  async function onImport(file: File) {
    try {
      const json = JSON.parse(await file.text());
      const { count } = await importBackup.mutateAsync(json);
      toast({ message: `Restored ${count} expenses.` });
    } catch {
      toast({ message: 'That file is not a valid Ledgr backup.' });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-serif text-2xl font-semibold text-ink lg:hidden">Settings</h1>

      <PaperCard
        className="flex items-center gap-4 p-4"
        onClick={() => {
          setNameDraft(user.name);
          setNameOpen(true);
        }}
      >
        <AvatarBubble name={user.name} size={50} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold text-ink">{user.name}</div>
          <div className="truncate text-sm text-ink-muted">{user.email}</div>
        </div>
        <User size={18} className="text-ink-soft" />
      </PaperCard>

      <SectionLabel>Account</SectionLabel>
      <GroupedList>
        <GroupedRow
          icon="banknote"
          label="Currency"
          trailing={
            <span className="text-sm font-semibold text-ink-muted">
              {s.currencyCode} {CURRENCIES.find((c) => c.code === s.currencyCode)?.symbol}
            </span>
          }
          onClick={() => setCurrencyOpen(true)}
        />
        <GroupedRow icon="shapes" label="Manage categories" onClick={() => router.push('/categories')} />
        <GroupedRow
          icon="palette"
          label="Theme"
          trailing={
            <div className="flex gap-1">
              {(['system', 'light', 'dark'] as ThemeMode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => {
                    setMode(m);
                    void patch({ themeMode: m });
                  }}
                  className={cn(
                    'rounded-sm px-2 py-1 text-xs font-semibold capitalize',
                    s.themeMode === m ? 'bg-terracotta text-white' : 'bg-canvas-alt text-ink-muted',
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
          }
        />
      </GroupedList>

      <SectionLabel>Notifications</SectionLabel>
      <GroupedList>
        <GroupedRow
          icon="bell"
          label="Daily reminder"
          trailing={<Switch checked={s.reminderEnabled} onCheckedChange={onToggleReminders} />}
        />
        {s.reminderEnabled ? (
          <GroupedRow
            icon="clock"
            label="Reminder time"
            trailing={
              <input
                type="time"
                value={s.reminderTime}
                onChange={(e) => void patch({ reminderTime: e.target.value })}
                className="rounded-sm border border-stroke bg-paper px-2 py-1 text-sm tnum outline-none"
              />
            }
          />
        ) : null}
      </GroupedList>

      <SectionLabel>Data</SectionLabel>
      <GroupedList>
        <GroupedRow
          icon="file-down"
          label="Export as CSV"
          onClick={() => download('/data/export/csv', 'ledgr-expenses.csv')}
        />
        <GroupedRow
          icon="database-backup"
          label="Back up all data (JSON)"
          onClick={() => download('/data/export/backup', 'ledgr-backup.json')}
        />
        <GroupedRow icon="upload" label="Import a backup" onClick={() => fileRef.current?.click()} />
      </GroupedList>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void onImport(file);
          e.target.value = '';
        }}
      />

      <SectionLabel>About</SectionLabel>
      <GroupedList>
        <GroupedRow icon="shield-check" label="Privacy" trailing={<span className="text-sm text-ink-soft">Your data stays yours</span>} />
        <GroupedRow icon="info" label="Version" trailing={<span className="text-sm text-ink-soft">1.0.0</span>} />
      </GroupedList>

      <Button
        variant="outline"
        className="mt-2"
        onClick={async () => {
          await logout();
          router.replace('/login');
        }}
      >
        <LogOut size={16} /> Log out
      </Button>

      {/* Currency picker */}
      <ResponsiveDialog open={currencyOpen} onOpenChange={setCurrencyOpen} title="Currency">
        <div className="flex max-h-[60vh] flex-col overflow-y-auto">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={async () => {
                await patch({ currencyCode: c.code });
                setCurrencyOpen(false);
              }}
              className="flex items-center gap-3 rounded-sm px-2 py-3 text-left hover:bg-paper-warm"
            >
              <span className="w-10 text-center text-lg">{c.symbol}</span>
              <span className="flex-1 text-ink">
                {c.code} — {c.displayName}
              </span>
              {s.currencyCode === c.code ? <Check size={18} className="text-terracotta" /> : null}
            </button>
          ))}
        </div>
      </ResponsiveDialog>

      {/* Name editor */}
      <ResponsiveDialog open={nameOpen} onOpenChange={setNameOpen} title="Your name">
        <div className="flex flex-col gap-4">
          <Field label="Name" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus />
          <Button
            disabled={!nameDraft.trim()}
            onClick={async () => {
              await patch({ name: nameDraft.trim() });
              setNameOpen(false);
            }}
          >
            Save
          </Button>
        </div>
      </ResponsiveDialog>
    </div>
  );
}
