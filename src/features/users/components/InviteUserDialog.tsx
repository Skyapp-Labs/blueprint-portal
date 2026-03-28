'use client';

import React, { useState } from 'react';
import { useInviteUser } from '../hooks/useUsers';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/dialog';
import { useToast } from '@/shared/components/toast';

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function InviteUserDialog({ open, onClose }: InviteUserDialogProps) {
  const invite = useInviteUser();
  const { toast } = useToast();
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await invite.mutateAsync({
        email: form.email,
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
      });
      toast({ title: 'Invitation sent', description: `Invite sent to ${form.email}`, variant: 'success' });
      setForm({ email: '', firstName: '', lastName: '' });
      onClose();
    } catch (err) {
      toast({ title: 'Failed to send invite', description: String(err), variant: 'error' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Invite User</DialogTitle>
          <DialogDescription>
            Send an email invitation to a new user. They will receive a link to set up their account.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Email *</label>
            <Input
              type="email"
              required
              placeholder="user@example.com"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">First name</label>
              <Input
                placeholder="John"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Last name</label>
              <Input
                placeholder="Doe"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={invite.isPending}>
              Send Invite
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
