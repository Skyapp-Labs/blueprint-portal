'use client';

import { TopBar } from '@/shared/components/top-bar';
import { Activity } from 'lucide-react';

export default function LogsPage() {
  return (
    <>
      <TopBar title="Logs & Monitoring" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Logs & Monitoring</h2>
          <p className="text-sm text-muted-foreground">
            API request logs, error tracking, and performance metrics.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center h-64 rounded-xl border border-dashed border-border gap-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Activity className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-medium">Logs coming soon</p>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time API request logs and error tracking will be available here.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
