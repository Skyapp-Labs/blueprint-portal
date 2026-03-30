'use client';

import React, { useState } from 'react';
import { useSettings, useUpdateSetting } from '../hooks/useSettings';
import type { Setting } from '../types/setting.type';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { useToast } from '@/shared/components/toast';
import { Pencil, Check, X, RefreshCw, Lock } from 'lucide-react';

function groupSettings(settings: Setting[]): Record<string, Setting[]> {
  return settings.reduce<Record<string, Setting[]>>((acc, s) => {
    (acc[s.group] ??= []).push(s);
    return acc;
  }, {});
}

// Render a value in read-only mode: arrays as individual code tags, booleans as badge
function SettingValue({ setting }: { setting: Setting }) {
  if (setting.type === 'boolean') {
    const isTrue = setting.value === 'true' || setting.value === '1';
    return (
      <Badge variant={isTrue ? 'success' : 'secondary'} className="text-[10px]">
        {isTrue ? 'true' : 'false'}
      </Badge>
    );
  }

  const trimmed = setting.value?.trim() ?? '';
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const inner = trimmed.slice(1, -1).trim();
    if (inner) {
      const items = inner.split(/},\s*\{/);
      return (
        <div className="flex flex-wrap gap-1">
          {items.map((item, i) => {
            let chunk = item.trim();
            if (!chunk.startsWith('{')) chunk = '{' + chunk;
            if (!chunk.endsWith('}')) chunk = chunk + '}';
            return (
              <code key={i} className="text-xs bg-muted px-2 py-0.5 rounded">
                {chunk}
              </code>
            );
          })}
        </div>
      );
    }
    return <code className="text-xs bg-muted px-2 py-0.5 rounded">[]</code>;
  }

  return (
    <code className="text-xs bg-muted px-2 py-0.5 rounded">
      {setting.value || '—'}
    </code>
  );
}

function SettingRow({ setting }: { setting: Setting }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(setting.value);
  const update = useUpdateSetting();
  const { toast } = useToast();

  async function save(overrideVal?: string) {
    const saveVal = overrideVal ?? val;
    try {
      await update.mutateAsync({ key: setting.key, value: saveVal });
      toast({ title: 'Setting updated', variant: 'success' });
      setEditing(false);
    } catch (err) {
      toast({ title: 'Failed to update', description: String(err), variant: 'error' });
    }
  }

  function cancel() {
    setVal(setting.value);
    setEditing(false);
  }

  // Boolean: render inline toggle, no separate edit mode needed
  if (setting.type === 'boolean' && setting.isEditable) {
    const isTrue = setting.value === 'true' || setting.value === '1';
    return (
      <tr className="border-b border-border hover:bg-muted/30 transition-colors">
        <td className="px-4 py-3 w-72">
          <p className="text-sm font-mono text-foreground">{setting.key}</p>
          {setting.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
          )}
        </td>
        <td className="px-4 py-3">
          <Badge variant="secondary" className="text-[10px]">{setting.type}</Badge>
        </td>
        <td className="px-4 py-3 w-full">
          <SettingValue setting={setting} />
        </td>
        <td className="px-4 py-3 text-right">
          <button
            role="switch"
            aria-checked={isTrue}
            disabled={update.isPending}
            onClick={() => save(isTrue ? 'false' : 'true')}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none disabled:opacity-50 ${isTrue ? 'bg-primary' : 'bg-input'}`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-lg transition-transform ${isTrue ? 'translate-x-4' : 'translate-x-0'}`}
            />
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-border hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3 w-72">
        <p className="text-sm font-mono text-foreground">{setting.key}</p>
        {setting.description && (
          <p className="text-xs text-muted-foreground mt-0.5">{setting.description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant="secondary" className="text-[10px]">
          {setting.type}
        </Badge>
      </td>
      <td className="px-4 py-3 w-full">
        {editing ? (
          <div className="flex items-center gap-2">
            <Input
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="max-w-xs h-7 text-xs"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="h-7 w-7" loading={update.isPending} onClick={() => save()}>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancel}>
              <X className="h-3.5 w-3.5 text-red-600" />
            </Button>
          </div>
        ) : (
          <SettingValue setting={setting} />
        )}
      </td>
      <td className="px-4 py-3 text-right">
        {setting.isEditable ? (
          !editing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )
        ) : (
          <Lock className="h-3.5 w-3.5 text-muted-foreground inline" />
        )}
      </td>
    </tr>
  );
}

export function SettingsTable() {
  const { data, isLoading, isError, refetch } = useSettings();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 rounded bg-muted animate-pulse" />
            <div className="rounded-lg border border-border overflow-hidden">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="px-4 py-3 border-b border-border flex gap-4">
                  <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-32 rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <p className="text-muted-foreground">Failed to load settings</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const grouped = groupSettings(data ?? []);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([group, settings]) => (
        <div key={group}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {group}
          </h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                  <th className="px-4 py-2 text-left font-medium text-xs">Key</th>
                  <th className="px-4 py-2 text-left font-medium text-xs">Type</th>
                  <th className="px-4 py-2 text-left font-medium text-xs">Value</th>
                  <th className="px-4 py-2 text-right font-medium text-xs">Edit</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <SettingRow key={s.key} setting={s} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
