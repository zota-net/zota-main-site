'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Eye, EyeOff, ArrowRight, Loader2, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStore } from '@/lib/store/user-store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  rememberMe: z.boolean(),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const { login, verifyLoginOtp, isLoading, error, otpPending, otpEmail } = useUserStore();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await login(data.email, data.password);
    if (result === true) {
      router.push('/dashboard');
    }
    // if 'otp_required', the store sets otpPending=true and the OTP form renders
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    const email = otpEmail || form.getValues('email');
    const success = await verifyLoginOtp(email, data.otp);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[440px]"
    >
      <AnimatePresence mode="wait">
        {!otpPending ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <div className="flex flex-col items-center mb-8 text-center">
              <h1 className="font-geist font-semibold text-[1.8rem] tracking-tight text-[var(--text-primary)] mb-2">
                Welcome back
              </h1>
              <p className="text-[1rem] text-[var(--text-secondary)]">
                Sign into your XetiHub operator dashboard
              </p>
            </div>

            <Card className="border-[var(--border)] bg-[var(--bg-primary)] shadow-sm rounded-2xl overflow-hidden p-2 sm:p-4">
              <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="font-medium text-[0.85rem] text-[var(--text-primary)]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@company.com"
                      autoComplete="email"
                      disabled={isLoading}
                      className="h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors text-[1rem]"
                      {...form.register('email')}
                    />
                    {form.formState.errors.email && (
                      <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-medium text-[0.85rem] text-[var(--text-primary)]">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors pr-10 text-[1rem]"
                        {...form.register('password')}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {form.formState.errors.password && (
                      <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        disabled={isLoading}
                        onCheckedChange={(checked) => form.setValue('rememberMe', !!checked)}
                        className="border-[var(--border-strong)] data-[state=checked]:bg-[var(--brand-orange)] data-[state=checked]:border-[var(--brand-orange)]"
                      />
                      <Label htmlFor="rememberMe" className="text-sm font-normal text-[var(--text-secondary)] cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <button
                      type="button"
                      onClick={() => router.push('/forgot-password')}
                      className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-[1rem] font-medium bg-[var(--brand-orange)] text-white shadow-sm shadow-[var(--brand-orange)]/20 hover:shadow-md hover:shadow-[var(--brand-orange)]/40 hover:bg-[#e65c00] hover:-translate-y-0.5 transition-all duration-200 mt-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Enter Platform <ArrowRight className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-[0.95rem] text-[var(--text-secondary)] mt-8">
              Don&apos;t have an account?{' '}
              <button
                onClick={() => router.push('/register')}
                className="text-[var(--text-primary)] font-medium hover:underline underline-offset-4"
              >
                Sign up
              </button>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="h-16 w-16 rounded-full bg-[var(--brand-orange)]/10 flex items-center justify-center mb-4">
                <ShieldCheck className="w-8 h-8 text-[var(--brand-orange)]" />
              </div>
              <h1 className="font-geist font-semibold text-[1.8rem] tracking-tight text-[var(--text-primary)] mb-2">
                Verify your login
              </h1>
              <p className="text-[1rem] text-[var(--text-secondary)]">
                A 6-digit code was sent to
              </p>
              <p className="font-medium text-[var(--text-primary)] flex items-center gap-1 mt-1">
                <Mail className="w-4 h-4" />
                {otpEmail}
              </p>
            </div>

            <Card className="border-[var(--border)] bg-[var(--bg-primary)] shadow-sm rounded-2xl overflow-hidden p-2 sm:p-4">
              <CardContent className="p-6">
                <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="font-medium text-[0.85rem] text-[var(--text-primary)]">
                      One-Time Code
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="000000"
                      maxLength={6}
                      disabled={isLoading}
                      className="h-14 text-center text-2xl tracking-[0.5em] font-mono bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)]"
                      {...otpForm.register('otp')}
                    />
                    {otpForm.formState.errors.otp && (
                      <p className="text-xs text-destructive">{otpForm.formState.errors.otp.message}</p>
                    )}
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-[1rem] font-medium bg-[var(--brand-orange)] text-white hover:bg-[#e65c00] hover:-translate-y-0.5 transition-all duration-200"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>Verify &amp; Sign In <ShieldCheck className="w-4 h-4 ml-2" /></>
                    )}
                  </Button>

                  <p className="text-center text-sm text-[var(--text-secondary)]">
                    <button
                      type="button"
                      onClick={() => {
                        useUserStore.setState({ otpPending: false, otpEmail: null, error: null });
                      }}
                      className="hover:text-[var(--text-primary)] transition-colors underline underline-offset-4"
                    >
                      Back to login
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>

            <p className="text-center text-sm text-[var(--text-secondary)] mt-6">
              Didn&apos;t receive a code? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => {
                  useUserStore.setState({ otpPending: false, otpEmail: null, error: null });
                }}
                className="font-medium text-[var(--text-primary)] hover:underline underline-offset-4"
              >
                try again
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
