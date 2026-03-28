'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutDashboard, Eye, EyeOff, Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { authService, type AuthConfig } from '@/core/auth/authService';
import { apiClient } from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { useAuthStore, type AdminUser } from '@/store/auth.store';
import { Button } from '@/shared/components/button';
import { Input } from '@/shared/components/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/card';
import { APP_CONFIG } from '@/config/app.config';

// ─── Email / password flow ────────────────────────────────────────────────────

function EmailLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authService.login({ email, password });
      try {
        const user = await apiClient.get<AdminUser>(ENDPOINTS.AUTH.ME);
        setUser(user);
      } catch { /* non-critical */ }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-1.5 block">Email</label>
        <Input
          type="email"
          required
          autoComplete="email"
          placeholder="admin@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium mb-1.5 block">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" loading={loading}>
        Sign in
      </Button>
    </form>
  );
}

// ─── Phone / OTP flow ─────────────────────────────────────────────────────────

type PhoneStep = 'phone' | 'otp';

function PhoneLoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [step, setStep] = useState<PhoneStep>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  function startResendTimer(ms: number) {
    setResendIn(Math.ceil(ms / 1000));
    timerRef.current = setInterval(() => {
      setResendIn((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.sendOtp(phone);
      setVerificationId(res.verificationId);
      startResendTimer(res.resendIn);
      setStep('otp');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendIn > 0) return;
    setError('');
    setLoading(true);
    try {
      const res = await authService.resendOtp(verificationId);
      setVerificationId(res.verificationId);
      startResendTimer(res.resendIn);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const verified = await authService.verifyOtp(verificationId, otp);
      await authService.loginWithToken(verified.verificationToken);
      try {
        const user = await apiClient.get<AdminUser>(ENDPOINTS.AUTH.ME);
        setUser(user);
      } catch { /* non-critical */ }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  }

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOtp} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Phone number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              required
              autoComplete="tel"
              placeholder="+2348012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Send OTP
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <button
          type="button"
          onClick={() => { setStep('phone'); setError(''); setOtp(''); }}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <p className="text-sm text-muted-foreground">
          OTP sent to <span className="font-medium text-foreground">{phone}</span>
        </p>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">One-time code</label>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          autoComplete="one-time-code"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          autoFocus
        />
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" loading={loading}>
        Verify &amp; Sign in
      </Button>

      <button
        type="button"
        disabled={resendIn > 0}
        onClick={handleResend}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <RefreshCw className="h-3 w-3" />
        {resendIn > 0 ? `Resend OTP in ${resendIn}s` : 'Resend OTP'}
      </button>
    </form>
  );
}

// ─── Main login wrapper ───────────────────────────────────────────────────────

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
        // fallback to email if config fails
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

export default function LoginPage() {
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
