'use client';

import React from 'react';
import { useRoles, useDeleteRole } from '../hooks/useRoles';
import type { Role } from '../types/role.type';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/shared/components/toast';
import { MoreHorizontal, Trash2, Shield, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/dropdown-menu';

interface RoleTableProps {
  onSelect?: (role: Role) => void;
}

export function RoleTable({ onSelect }: RoleTableProps) {
  const { data: roles = [], isLoading, isError, refetch } = useRoles();
  const remove = useDeleteRole();
  const { toast } = useToast();

  async function handleDelete(role: Role) {
    setOpenMenu(null);
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      await remove.mutateAsync(role.id);
      toast({ title: 'Role deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Delete failed', description: String(err), variant: 'error' });
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
        <p className="text-muted-foreground">Failed to load roles</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 text-muted-foreground border-b border-border">
            <th className="px-4 py-3 text-left font-medium">Role</th>
            <th className="px-4 py-3 text-left font-medium">Slug</th>
            <th className="px-4 py-3 text-left font-medium">Permissions</th>
            <th className="px-4 py-3 text-left font-medium">Created</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {roles.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                No roles found
              </td>
            </tr>
          ) : (
            roles.map((role) => (
              <tr
                key={role.id}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => onSelect?.(role)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{role.name}</p>
                      {role.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-xs">
                          {role.description}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                    {role.slug}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">
                    {role.permissions?.length ?? 0} permissions
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {formatDate(role.createdAt)}
                </td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelect?.(role)}>
                        <Shield className="h-3.5 w-3.5" /> Manage
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem destructive onClick={() => handleDelete(role)}>
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
  );
}
