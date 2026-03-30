'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/dialog';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { useCreateRole } from '../hooks/useRoles';
import { useToast } from '@/shared/components/toast';

interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s]+/g, '-');
}

export function CreateRoleDialog({ open, onClose }: CreateRoleDialogProps) {
  const create = useCreateRole();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [slugEdited, setSlugEdited] = useState(false);

  function handleNameChange(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: slugEdited ? f.slug : toSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setForm((f) => ({ ...f, slug: toSlug(value) }));
  }

  function reset() {
    setForm({ name: '', slug: '', description: '' });
    setSlugEdited(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    try {
      await create.mutateAsync({
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || undefined,
      });
      toast({ title: `Role "${form.name}" created`, variant: 'success' });
      handleClose();
    } catch (err) {
      toast({ title: 'Failed to create role', description: String(err), variant: 'error' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Role</DialogTitle>
          <DialogDescription>
            Define a new role. You can assign permissions after creation.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Support Agent"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Slug <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. support-agent"
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used internally as the role identifier. Lowercase, hyphens only.
            </p>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <Input
              placeholder="Optional description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={create.isPending}
              disabled={!form.name.trim() || !form.slug.trim()}
            >
              Create Role
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
