'use client';

import React from 'react';
import { Bell, LogOut, Moon, Sun, Monitor, User } from 'lucide-react';
import { useAuthStore } from '@/shared/store/auth.store';
import { authService } from '@/features/auth/api/auth.api';
import { getInitials } from '@/shared/lib/utils';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import { useTheme } from 'next-themes';

export function TopBar({ title }: { title: string }) {
  const user = useAuthStore((s) => s.user);
  const { setTheme } = useTheme();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = React.useState(false);

  async function handleLogout() {
    await authService.logout();
    router.replace('/login');
  }

  return (
    <header className="h-14 border-b border-border px-6 flex items-center justify-between shrink-0 bg-background">
      <h1 className="text-base font-semibold">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Theme switcher */}
        <Button
          variant="ghost"
          size="icon"
          title="Light"
          onClick={() => setTheme('light')}
          className="hidden sm:flex"
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Dark"
          onClick={() => setTheme('dark')}
          className="hidden sm:flex"
        >
          <Moon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="System"
          onClick={() => setTheme('system')}
          className="hidden sm:flex"
        >
          <Monitor className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon">
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
              {user ? getInitials(user.firstName, user.lastName) : <User className="h-4 w-4" />}
            </div>
            {user && (
              <span className="text-sm hidden md:block">
                {user.firstName} {user.lastName}
              </span>
            )}
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-48 rounded-md border border-border bg-background shadow-lg z-50">
              {user && (
                <div className="px-3 py-2 border-b border-border">
                  <p className="text-sm font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              )}
              <button
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-muted transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
