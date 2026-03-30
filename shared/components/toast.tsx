'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
  onClose?: () => void;
}

export function Toast({ title, description, variant = 'default', onClose }: ToastProps) {
  const variants = {
    default: 'bg-background border-border',
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  };

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm rounded-lg border p-4 shadow-lg',
        variants[variant],
      )}
    >
      <div className="flex-1">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-muted-foreground hover:text-foreground">
          ×
        </button>
      )}
    </div>
  );
}

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...item, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            title={t.title}
            description={t.description}
            variant={t.variant}
            onClose={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
