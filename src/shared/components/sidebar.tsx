'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Users,
  Settings,
  Activity,
  Rewind,
  Bell,
  ToggleLeft,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui.store';
import { APP_CONFIG } from '@/config/app.config';

const navItems = [
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/logs', label: 'Logs', icon: Activity },
  { href: '/admin/replay', label: 'Replay', icon: Rewind },
  { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  { href: '/admin/feature-flags', label: 'Feature Flags', icon: ToggleLeft },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-border bg-sidebar transition-all duration-300 shrink-0',
        sidebarOpen ? 'w-56' : 'w-14',
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-3 border-b border-border overflow-hidden">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center shrink-0">
            <LayoutDashboard className="h-4 w-4 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-sm truncate">{APP_CONFIG.appName}</span>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={!sidebarOpen ? item.label : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full border border-border bg-background flex items-center justify-center shadow-sm hover:bg-muted transition-colors z-10"
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
      </button>
    </aside>
  );
}
