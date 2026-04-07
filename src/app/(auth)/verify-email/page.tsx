'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, ArrowRight, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common';
import { authService } from '@/lib/api/services/auth';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const verifySchema = z.object({
  verificationCode: z.string().min(6, 'Verification code must be 6 digits').max(6, 'Verification code must be 6 digits'),
});

type VerifyFormData = z.infer<typeof verifySchema>;

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [isVerified, setIsVerified] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      verificationCode: '',
    },
  });

  const onSubmit = async (data: VerifyFormData) => {
    try {
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '';
      await authService.verifyEmail({
        email,
        verificationCode: data.verificationCode,
        client_id: clientId,
      });

      setIsVerified(true);
      toast.success('Email verified successfully! You can now log in.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      toast.error('Invalid verification code. Please try again.');
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '';
      await authService.resendVerificationCode(email, clientId);
      toast.success('Verification code sent to your email.');
    } catch (error) {
      toast.error('Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <Card className="border-border/50 shadow-xl">
            <CardContent className="pt-8 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground mb-6">
                Your email has been successfully verified. You can now log in to your account.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Continue to Login
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-gradient-to-br from-background via-background to-muted/50 overflow-hidden"
      >
        <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 w-full">
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
                Verify your
                <span className="text-primary block mt-1">email address.</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                We've sent a verification code to your email. Please enter it below to complete your registration.
              </p>
            </motion.div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/30 border border-border/50">
              <Mail className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  {email ? `Code sent to ${email}` : 'No email provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel — Form */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-10"
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Logo className="w-10 h-10 mx-auto" />
            <span className="text-xl font-semibold tracking-tight block mt-2">
              Xeti<span className="text-primary">Hub</span>
            </span>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Enter Verification Code
              </CardTitle>
              <CardDescription>
                Enter the 6-digit code sent to your email
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Verification Code */}
                <div className="space-y-2">
                  <Label htmlFor="verificationCode" className="text-sm font-medium">
                    Verification Code
                  </Label>
                  <Input
                    id="verificationCode"
                    placeholder="123456"
                    className="text-center text-lg tracking-widest"
                    maxLength={6}
                    {...form.register('verificationCode')}
                  />
                  {form.formState.errors.verificationCode && (
                    <p className="text-xs text-destructive">{form.formState.errors.verificationCode.message}</p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify Email
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Resend Code */}
              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground mb-3">
                  Didn't receive the code?
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={isResending || !email}
                  className="w-full"
                >
                  {isResending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Resend Code
                </Button>
              </div>

              {/* Back to Login */}
              <div className="mt-6 text-center">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="text-sm"
                >
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}