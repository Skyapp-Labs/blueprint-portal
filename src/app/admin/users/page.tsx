'use client';

import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { TopBar } from '@/app/admin/_components/TopBar';
import { Button } from '@/shared/components/ui/button';
import { UserTable } from '@/features/users/components/UserTable';
import { UserDetailPanel } from '@/features/users/components/UserDetailPanel';
import { InviteUserDialog } from '@/features/users/components/InviteUserDialog';
import type { User } from '@/features/users/types/user.type';

export default function UsersPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <TopBar title="Users" />
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">All Users</h2>
              <p className="text-sm text-muted-foreground">Manage user accounts and permissions</p>
            </div>
            <Button onClick={() => setInviteOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </div>

          <UserTable onSelect={setSelectedUser} />
        </div>

        {selectedUser && (
          <div className="w-96 border-l border-border bg-background overflow-y-auto shrink-0">
            <UserDetailPanel
              user={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          </div>
        )}
      </main>

      <InviteUserDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </>
  );
}
