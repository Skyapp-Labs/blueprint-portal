'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone, ArrowLeft, RefreshCw } from 'lucide-react';
import { authService } from '@/features/auth/api/auth.api';
import { useAuthStore, type AdminUser } from '@/shared/store/auth.store';
import { apiClient } from '@/core/api/apiClient';
import { ENDPOINTS } from '@/core/api/endpoints';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type PhoneStep = 'phone' | 'otp';

interface Props {
  onSuccess: () => void;
}

export function PhoneLoginForm({ onSuccess }: Props) {
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
