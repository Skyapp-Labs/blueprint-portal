'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard } from 'lucide-react';
import { authService, type AuthConfig } from '@/features/auth/api/auth.api';
import { EmailLoginForm } from './EmailLoginForm';
import { PhoneLoginForm } from './PhoneLoginForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { APP_CONFIG } from '@/core/config/app.config';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/admin/users';

  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    authService.getConfig()
      .then(setConfig)
      .catch(() => {
        setConfig({ authMethod: 'email', passwordResetEnabled: false });
        setConfigError(true);
      });
  }, []);

  function handleSuccess() {
    router.replace(redirect);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
            <LayoutDashboard className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{APP_CONFIG.appName}</h1>
          <p className="text-sm text-muted-foreground mt-1">API Blueprint System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              {config?.authMethod === 'phone'
                ? 'Enter your phone number to receive an OTP'
                : 'Enter your credentials to access the admin portal'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!config ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : config.authMethod === 'phone' ? (
              <PhoneLoginForm onSuccess={handleSuccess} />
            ) : (
              <EmailLoginForm onSuccess={handleSuccess} />
            )}

            {configError && (
              <p className="text-xs text-muted-foreground text-center mt-3">
                Using default login method
              </p>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          {APP_CONFIG.appName} &middot; v{APP_CONFIG.version}
        </p>
      </div>
    </div>
  );
}

export function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
