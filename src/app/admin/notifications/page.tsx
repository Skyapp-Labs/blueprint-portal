'use client';

import { TopBar } from '@/app/admin/_components/TopBar';
import { Bell, Mail, MessageSquare, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';

const providers = [
  {
    id: 'sms',
    icon: MessageSquare,
    title: 'SMS Providers',
    description: 'Manage Twilio, SmartSMS, Termii and other SMS gateways.',
    items: ['Twilio', 'SmartSMS', 'Termii'],
  },
  {
    id: 'email',
    icon: Mail,
    title: 'Email Providers',
    description: 'Configure SMTP and email delivery services.',
    items: ['SMTP', 'SendGrid', 'Mailgun'],
  },
  {
    id: 'test',
    icon: Send,
    title: 'Test Notifications',
    description: 'Trigger test messages to verify provider configuration.',
    items: [],
  },
];

export default function NotificationsPage() {
  return (
    <>
      <TopBar title="Notifications" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Notification Providers</h2>
          <p className="text-sm text-muted-foreground">
            Manage SMS and email providers, and trigger test notifications.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.id} className="opacity-80">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{p.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>{p.description}</CardDescription>
                </CardHeader>
                {p.items.length > 0 && (
                  <CardContent>
                    <ul className="space-y-1.5">
                      {p.items.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-border gap-2">
          <Bell className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Full notification management coming soon. Configure providers in Settings.
          </p>
        </div>
      </main>
    </>
  );
}
