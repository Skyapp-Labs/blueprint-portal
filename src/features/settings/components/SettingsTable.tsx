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

function SettingRow({ setting }: { setting: Setting }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(setting.value);
  const update = useUpdateSetting();
  const { toast } = useToast();

  async function save() {
    try {
      await update.mutateAsync({ key: setting.key, value: val });
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
            <Button size="icon" variant="ghost" className="h-7 w-7" loading={update.isPending} onClick={save}>
              <Check className="h-3.5 w-3.5 text-emerald-600" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={cancel}>
              <X className="h-3.5 w-3.5 text-red-600" />
            </Button>
          </div>
        ) : (
          <code className="text-xs bg-muted px-2 py-0.5 rounded">{setting.value || '—'}</code>
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
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
