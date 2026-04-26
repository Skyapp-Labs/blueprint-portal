'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { X, Shield, Save, Edit2, Calendar, Activity } from 'lucide-react';
import { useRole, useModules } from '../queries/roles.queries';
import { useUpdateRole, useSetRolePermissions } from '../mutations/roles.mutations';
import type { Role } from '../types/role.type';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { formatDate } from '@/shared/lib/utils';
import { useToast } from '@/shared/components/layout/toast';
import { cn } from '@/shared/lib/utils';

interface RoleDetailPanelProps {
  role: Role;
  onClose: () => void;
}

export function RoleDetailPanel({ role: initialRole, onClose }: RoleDetailPanelProps) {
  const { data: role } = useRole(initialRole.id);
  const current = role ?? initialRole;
  const { data: modules = [], isLoading: modulesLoading } = useModules();
  const updateRole = useUpdateRole();
  const setPermissions = useSetRolePermissions();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: current.name, description: current.description ?? '' });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set((current.permissions ?? []).map((p) => p.id)),
  );

  useEffect(() => {
    setSelectedIds(new Set((current.permissions ?? []).map((p) => p.id)));
    setForm({ name: current.name, description: current.description ?? '' });
  }, [current.id, current.permissions, current.name, current.description]);

  const permissionsDirty = useMemo(() => {
    const original = new Set((current.permissions ?? []).map((p) => p.id));
    if (original.size !== selectedIds.size) return true;
    for (const id of selectedIds) if (!original.has(id)) return true;
    return false;
  }, [current.permissions, selectedIds]);

  function togglePermission(permId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  }

  function toggleModule(permIds: string[], allSelected: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      permIds.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  async function handleSaveInfo() {
    try {
      await updateRole.mutateAsync({ id: current.id, payload: { name: form.name, description: form.description || undefined } });
      toast({ title: 'Role updated', variant: 'success' });
      setEditing(false);
    } catch (err) {
      toast({ title: 'Update failed', description: String(err), variant: 'error' });
    }
  }

  async function handleSavePermissions() {
    try {
      await setPermissions.mutateAsync({
        id: current.id,
        payload: { permissionIds: Array.from(selectedIds) },
      });
      toast({ title: 'Permissions saved', variant: 'success' });
    } catch (err) {
      toast({ title: 'Save failed', description: String(err), variant: 'error' });
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{current.name}</h2>
            <code className="text-xs text-muted-foreground font-mono">{current.slug}</code>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Info */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>
            {!editing && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
          </div>
          {editing ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                <Input
                  value={form.description}
                  placeholder="Optional description"
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" loading={updateRole.isPending} onClick={handleSaveInfo}>
                  <Save className="h-3.5 w-3.5" /> Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Permissions</span>
                <Badge variant="secondary">{current.permissions?.length ?? 0}</Badge>
              </div>
              {current.description && (
                <p className="text-muted-foreground">{current.description}</p>
              )}
            </div>
          )}
        </section>

        {/* Permissions */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Permissions
            </h3>
            {permissionsDirty && (
              <Button
                size="sm"
                loading={setPermissions.isPending}
                onClick={handleSavePermissions}
              >
                <Save className="h-3.5 w-3.5" /> Save
              </Button>
            )}
          </div>

          {modulesLoading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin h-5 w-5 rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : modules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules available</p>
          ) : (
            <div className="space-y-4">
              {modules.map((mod) => {
                const modPermIds = mod.permissions.map((p) => p.id);
                const selectedCount = modPermIds.filter((id) => selectedIds.has(id)).length;
                const allSelected = selectedCount === modPermIds.length && modPermIds.length > 0;
                const someSelected = selectedCount > 0 && !allSelected;

                return (
                  <div key={mod.id} className="rounded-md border border-border overflow-hidden">
                    <div
                      className="flex items-center justify-between px-3 py-2 bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors select-none"
                      onClick={() => toggleModule(modPermIds, allSelected)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            'h-4 w-4 rounded border flex items-center justify-center transition-colors',
                            allSelected
                              ? 'bg-primary border-primary'
                              : someSelected
                                ? 'bg-primary/40 border-primary'
                                : 'border-border bg-background',
                          )}
                        >
                          {(allSelected || someSelected) && (
                            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                              {allSelected ? (
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              ) : (
                                <path d="M2.5 6h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                              )}
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium">{mod.name}</span>
                        <code className="text-xs text-muted-foreground font-mono">{mod.slug}</code>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {selectedCount}/{modPermIds.length}
                      </span>
                    </div>

                    {mod.permissions.length > 0 && (
                      <div className="divide-y divide-border">
                        {mod.permissions.map((perm) => {
                          const checked = selectedIds.has(perm.id);
                          return (
                            <label
                              key={perm.id}
                              className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted/20 transition-colors"
                            >
                              <div
                                className={cn(
                                  'h-4 w-4 rounded border flex items-center justify-center shrink-0 transition-colors',
                                  checked ? 'bg-primary border-primary' : 'border-border bg-background',
                                )}
                                onClick={() => togglePermission(perm.id)}
                              >
                                {checked && (
                                  <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                              <div className="min-w-0 flex-1" onClick={() => togglePermission(perm.id)}>
                                <p className="text-sm font-medium">{perm.name}</p>
                                <code className="text-xs text-muted-foreground font-mono">{perm.slug}</code>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Metadata */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            System
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Created
              </span>
              <span>{formatDate(current.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-3.5 w-3.5" /> Updated
              </span>
              <span>{formatDate(current.updatedAt)}</span>
            </div>
            <p className="text-xs font-mono text-muted-foreground pt-1">ID: {current.id}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
