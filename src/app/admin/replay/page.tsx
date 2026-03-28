'use client';

import { TopBar } from '@/shared/components/top-bar';
import { Rewind } from 'lucide-react';

export default function ReplayPage() {
  return (
    <>
      <TopBar title="Replay" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Replay System</h2>
          <p className="text-sm text-muted-foreground">
            View user sessions, replay workflows, and debug interactions.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-border gap-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Rewind className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">Replay coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              Session replay and workflow debugging tools will be available here.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
