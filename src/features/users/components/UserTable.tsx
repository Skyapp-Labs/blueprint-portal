'use client';

import React, { useState } from 'react';
import {
  useUsers,
  useDeactivateUser,
  useActivateUser,
  useDeleteUser,
  useResendInvite,
  useRevokeInvite,
} from '../hooks/useUsers';
import type { User } from '../types/user.type';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { formatDate, formatRelative, getInitials } from '@/lib/utils';
import { useToast } from '@/shared/components/toast';
import {
  MoreHorizontal,
  UserCheck,
  UserX,
  Trash2,
  Mail,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
} from 'lucide-react';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'danger',
  revoked: 'secondary',
};

interface UserTableProps {
  onSelect?: (user: User) => void;
}

export function UserTable({ onSelect }: UserTableProps) {
  const [page, setPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { data, isLoading, isError, refetch } = useUsers(page, 20);
  const deactivate = useDeactivateUser();
  const activate = useActivateUser();
  const remove = useDeleteUser();
  const resend = useResendInvite();
  const revoke = useRevokeInvite();
  const { toast } = useToast();

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  async function handleAction(action: string, user: User) {
    setOpenMenu(null);
    try {
      if (action === 'deactivate') {
        await deactivate.mutateAsync(user.id);
        toast({ title: 'User deactivated', variant: 'success' });
      } else if (action === 'activate') {
        await activate.mutateAsync(user.id);
        toast({ title: 'User activated', variant: 'success' });
      } else if (action === 'delete') {
        if (!confirm(`Delete user ${user.firstName} ${user.lastName}?`)) return;
        await remove.mutateAsync(user.id);
        toast({ title: 'User deleted', variant: 'success' });
      } else if (action === 'resend-invite') {
        await resend.mutateAsync(user.id);
        toast({ title: 'Invite resent', variant: 'success' });
      } else if (action === 'revoke-invite') {
        await revoke.mutateAsync(user.id);
        toast({ title: 'Invite revoked', variant: 'success' });
      }
    } catch (err) {
      toast({ title: 'Error', description: String(err), variant: 'error' });
    }
  }

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
        <p className="text-muted-foreground">Failed to load users</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 text-muted-foreground border-b border-border">
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Contact</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Roles</th>
              <th className="px-4 py-3 text-left font-medium">Last Login</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => onSelect?.(user)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.firstName}
                            className="h-8 w-8 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(user.firstName, user.lastName)
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">{user.id.slice(0, 8)}…</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      {user.email && (
                        <span className="flex items-center gap-1 text-xs">
                          <Mail className="h-3 w-3" />
                          {user.email}
                          {user.isEmailVerified && (
                            <span className="text-emerald-500" title="Verified">✓</span>
                          )}
                        </span>
                      )}
                      {user.phoneNumber && (
                        <span className="text-xs text-muted-foreground">
                          {user.countryCode} {user.phoneNumber}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Badge variant={statusVariant[user.status] ?? 'secondary'}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(user.roles ?? []).map((r) => (
                        <Badge key={r.id} variant="outline">
                          {r.name}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatRelative(user.lastLoginAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="relative inline-block">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openMenu === user.id && (
                        <div className="absolute right-0 mt-1 w-44 rounded-md border border-border bg-background shadow-lg z-10">
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                            onClick={() => onSelect?.(user)}
                          >
                            View details
                          </button>
                          {user.status === 'active' ? (
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-amber-600"
                              onClick={() => handleAction('deactivate', user)}
                            >
                              <UserX className="h-3.5 w-3.5" /> Deactivate
                            </button>
                          ) : user.status === 'suspended' ? (
                            <button
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-emerald-600"
                              onClick={() => handleAction('activate', user)}
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Activate
                            </button>
                          ) : null}
                          {user.status === 'invited' && (
                            <>
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                                onClick={() => handleAction('resend-invite', user)}
                              >
                                <RefreshCw className="h-3.5 w-3.5" /> Resend invite
                              </button>
                              <button
                                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-amber-600"
                                onClick={() => handleAction('revoke-invite', user)}
                              >
                                <XCircle className="h-3.5 w-3.5" /> Revoke invite
                              </button>
                            </>
                          )}
                          <button
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-red-600"
                            onClick={() => handleAction('delete', user)}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total} users
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
