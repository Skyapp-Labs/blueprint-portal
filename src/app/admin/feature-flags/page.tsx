'use client';

import { TopBar } from '@/shared/components/top-bar';
import { ToggleLeft } from 'lucide-react';

const flags = [
  { key: 'auth.phone_enabled', label: 'Phone Auth', description: 'Allow users to sign in / register with phone number + OTP' },
  { key: 'auth.email_enabled', label: 'Email Auth', description: 'Allow users to sign in / register with email + password' },
  { key: 'auth.invite_only', label: 'Invite Only', description: 'Restrict registration to invited users only' },
  { key: 'notifications.sms_enabled', label: 'SMS Notifications', description: 'Enable SMS OTP and notification delivery' },
  { key: 'notifications.email_enabled', label: 'Email Notifications', description: 'Enable email notifications and verification' },
];

export default function FeatureFlagsPage() {
  return (
    <>
      <TopBar title="Feature Flags" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Feature Flags</h2>
          <p className="text-sm text-muted-foreground">
            Enable or disable system features and control API behaviour. Manage these values in{' '}
            <a href="/admin/settings" className="text-primary hover:underline">
              Settings
            </a>
            .
          </p>
        </div>

        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 py-3 text-left font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-4 py-3 text-left font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Key
                </th>
                <th className="px-4 py-3 text-left font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {flags.map((flag) => (
                <tr key={flag.key} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{flag.label}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-2 py-0.5 rounded">{flag.key}</code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{flag.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Toggle these flags by updating the corresponding keys in{' '}
          <a href="/admin/settings" className="text-primary hover:underline">
            Application Settings
          </a>
          .
        </p>
      </main>
    </>
  );
}
