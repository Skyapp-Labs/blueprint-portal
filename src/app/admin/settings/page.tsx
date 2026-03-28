'use client';

import { TopBar } from '@/shared/components/top-bar';
import { SettingsTable } from '@/features/settings/components/SettingsTable';

export default function SettingsPage() {
  return (
    <>
      <TopBar title="Settings" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Application Settings</h2>
          <p className="text-sm text-muted-foreground">
            Configure system behaviour. Changes take effect immediately — no restart required.
          </p>
        </div>
        <SettingsTable />
      </main>
    </>
  );
}
