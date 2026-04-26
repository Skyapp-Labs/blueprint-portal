'use client';

import React, { useState } from 'react';
import { X, Mail, Phone, Shield, Clock, Calendar, Activity } from 'lucide-react';
import { useUser } from '../queries/users.queries';
import { useUpdateUser } from '../mutations/users.mutations';
import type { User } from '../types/user.type';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { formatDate, formatRelative, getInitials } from '@/shared/lib/utils';
import { useToast } from '@/shared/components/layout/toast';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'danger',
  revoked: 'secondary',
};

interface UserDetailPanelProps {
  user: User;
  onClose: () => void;
}

export function UserDetailPanel({ user: initialUser, onClose }: UserDetailPanelProps) {
  const { data: user } = useUser(initialUser.id);
  const current = user ?? initialUser;
  const update = useUpdateUser();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: current.firstName,
    lastName: current.lastName,
    email: current.email ?? '',
    phoneNumber: current.phoneNumber ?? '',
  });

  async function handleSave() {
    try {
      await update.mutateAsync({
        id: current.id,
        payload: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email || undefined,
          phoneNumber: form.phoneNumber || undefined,
        },
      });
      toast({ title: 'User updated', variant: 'success' });
      setEditing(false);
    } catch (err) {
      toast({ title: 'Update failed', description: String(err), variant: 'error' });
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-border">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary shrink-0">
            {current.photoUrl ? (
              <img src={current.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover" />
            ) : (
              getInitials(current.firstName, current.lastName)
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {current.firstName} {current.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={statusVariant[current.status] ?? 'secondary'}>{current.status}</Badge>
              {!current.isActive && <Badge variant="danger">Inactive</Badge>}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Contact */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Contact
          </h3>
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">First name</label>
                  <Input
                    value={form.firstName}
                    onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Last name</label>
                  <Input
                    value={form.lastName}
                    onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Phone</label>
                <Input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((f) => ({ ...f, phoneNumber: e.target.value }))}
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" loading={update.isPending} onClick={handleSave}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {current.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{current.email}</span>
                  {current.isEmailVerified && (
                    <Badge variant="success" className="text-[10px]">Verified</Badge>
                  )}
                </div>
              )}
              {current.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {current.countryCode} {current.phoneNumber}
                  </span>
                  {current.isPhoneVerified && (
                    <Badge variant="success" className="text-[10px]">Verified</Badge>
                  )}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="mt-2">
                Edit
              </Button>
            </div>
          )}
        </section>

        {/* Roles */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Roles
          </h3>
          {(current.roles ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {current.roles.map((r) => (
                <div key={r.id} className="flex items-center gap-1.5 text-sm">
                  <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{r.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No roles assigned</p>
          )}
        </section>

        {/* Activity */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Activity
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" /> Last login
              </span>
              <span>{formatRelative(current.lastLoginAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Joined
              </span>
              <span>{formatDate(current.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Activity className="h-3.5 w-3.5" /> Updated
              </span>
              <span>{formatDate(current.updatedAt)}</span>
            </div>
          </div>
        </section>

        {/* System */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            System
          </h3>
          <div className="space-y-1.5 text-xs font-mono text-muted-foreground">
            <p>ID: {current.id}</p>
            {current.uid && <p>UID: {current.uid}</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
