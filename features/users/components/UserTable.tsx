'use client';

import React, { useState, useMemo } from 'react';
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
import { Input } from '@/shared/components/input';
import { ConfirmDialog } from '@/shared/components/confirm-dialog';
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
  Search,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/dropdown-menu';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'secondary'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'danger',
  revoked: 'secondary',
};

interface ConfirmState {
  action: 'deactivate' | 'activate' | 'delete' | 'revoke-invite';
  user: User;
}

interface UserTableProps {
  onSelect?: (user: User) => void;
}

export function UserTable({ onSelect }: UserTableProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { data, isLoading, isError, refetch } = useUsers(page, 20);
  const deactivate = useDeactivateUser();
  const activate = useActivateUser();
  const remove = useDeleteUser();
  const resend = useResendInvite();
  const revoke = useRevokeInvite();
  const { toast } = useToast();

  const allUsers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 20);

  // Client-side search + filter (until backend supports it)
  const filteredUsers = useMemo(() => {
    let result = allUsers;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.phoneNumber?.includes(q),
      );
    }
    if (statusFilter) {
      result = result.filter((u) => u.status === statusFilter);
    }
    return result;
  }, [allUsers, search, statusFilter]);

  // Summary counts
  const activeCount = allUsers.filter((u) => u.status === 'active').length;
  const suspendedCount = allUsers.filter((u) => u.status === 'suspended').length;
  const invitedCount = allUsers.filter((u) => u.status === 'invited').length;

  async function executeAction(action: string, user: User) {
    setActionLoading(true);
    try {
      if (action === 'deactivate') {
        await deactivate.mutateAsync(user.id);
        toast({ title: 'User deactivated', variant: 'success' });
      } else if (action === 'activate') {
        await activate.mutateAsync(user.id);
        toast({ title: 'User activated', variant: 'success' });
      } else if (action === 'delete') {
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
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  }

  function requestAction(action: ConfirmState['action'] | 'resend-invite', user: User) {
    if (action === 'resend-invite') {
      executeAction('resend-invite', user);
      return;
    }
    setConfirm({ action, user });
  }

  const confirmMeta: Record<ConfirmState['action'], { title: string; description: string; label: string; destructive: boolean }> = {
    deactivate: {
      title: 'Deactivate user?',
      description: `${confirm?.user.firstName} ${confirm?.user.lastName} will lose access until re-activated.`,
      label: 'Deactivate',
      destructive: false,
    },
    activate: {
      title: 'Activate user?',
      description: `${confirm?.user.firstName} ${confirm?.user.lastName} will regain access.`,
      label: 'Activate',
      destructive: false,
    },
    delete: {
      title: 'Delete user?',
      description: `This will permanently delete ${confirm?.user.firstName} ${confirm?.user.lastName}. This cannot be undone.`,
      label: 'Delete',
      destructive: true,
    },
    'revoke-invite': {
      title: 'Revoke invite?',
      description: `The invite for ${confirm?.user.firstName ?? confirm?.user.email} will be cancelled.`,
      label: 'Revoke',
      destructive: true,
    },
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
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
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, icon: Users, color: 'text-foreground' },
          { label: 'Active', value: activeCount, icon: UserCheck, color: 'text-emerald-600' },
          { label: 'Invited', value: invitedCount, icon: Mail, color: 'text-amber-600' },
          { label: 'Suspended', value: suspendedCount, icon: UserX, color: 'text-red-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3">
            <Icon className={`h-4 w-4 shrink-0 ${color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="flex gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email or phone…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-8 rounded-md border border-input bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="suspended">Suspended</option>
          <option value="revoked">Revoked</option>
        </select>
      </div>

      {/* Table */}
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
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Users className="h-8 w-8 opacity-30" />
                    <p className="text-sm">{search || statusFilter ? 'No users match your filters' : 'No users found'}</p>
                    {(search || statusFilter) && (
                      <button
                        className="text-xs text-primary hover:underline"
                        onClick={() => { setSearch(''); setStatusFilter(''); }}
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onSelect?.(user)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === 'active' ? (
                          <DropdownMenuItem onClick={() => requestAction('deactivate', user)}>
                            <UserX className="h-3.5 w-3.5 text-amber-600" />
                            <span className="text-amber-600">Deactivate</span>
                          </DropdownMenuItem>
                        ) : user.status === 'suspended' ? (
                          <DropdownMenuItem onClick={() => requestAction('activate', user)}>
                            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Activate</span>
                          </DropdownMenuItem>
                        ) : null}
                        {user.status === 'invited' && (
                          <>
                            <DropdownMenuItem onClick={() => requestAction('resend-invite', user)}>
                              <RefreshCw className="h-3.5 w-3.5" /> Resend invite
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => requestAction('revoke-invite', user)}>
                              <XCircle className="h-3.5 w-3.5 text-amber-600" />
                              <span className="text-amber-600">Revoke invite</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem destructive onClick={() => requestAction('delete', user)}>
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination — always visible when data loaded */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {filteredUsers.length < allUsers.length
            ? `${filteredUsers.length} of ${total} users`
            : `${total} user${total !== 1 ? 's' : ''} total`}
        </span>
        {totalPages > 1 && (
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
        )}
      </div>

      {/* Confirmation dialog */}
      {confirm && (
        <ConfirmDialog
          open
          title={confirmMeta[confirm.action].title}
          description={confirmMeta[confirm.action].description}
          confirmLabel={confirmMeta[confirm.action].label}
          destructive={confirmMeta[confirm.action].destructive}
          loading={actionLoading}
          onConfirm={() => executeAction(confirm.action, confirm.user)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}
