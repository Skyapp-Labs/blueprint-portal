'use client';

import React, { useState } from 'react';
import { ShieldPlus } from 'lucide-react';
import { TopBar } from '@/app/admin/_components/TopBar';
import { Button } from '@/shared/components/ui/button';
import { RoleTable } from '@/features/roles/components/RoleTable';
import { RoleDetailPanel } from '@/features/roles/components/RoleDetailPanel';
import { CreateRoleDialog } from '@/features/roles/components/CreateRoleDialog';
import type { Role } from '@/features/roles/types/role.type';

export default function RolesPage() {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <TopBar title="Roles & Permissions" />
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Roles</h2>
              <p className="text-sm text-muted-foreground">
                Manage roles and assign permissions to control access
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <ShieldPlus className="h-4 w-4" />
              Create Role
            </Button>
          </div>

          <RoleTable onSelect={setSelectedRole} />
        </div>

        {selectedRole && (
          <div className="w-96 border-l border-border bg-background overflow-y-auto shrink-0">
            <RoleDetailPanel
              role={selectedRole}
              onClose={() => setSelectedRole(null)}
            />
          </div>
        )}
      </main>

      <CreateRoleDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </>
  );
}
