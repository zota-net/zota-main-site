'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, ArrowRight, CheckCircle, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '@/lib/api/services/auth';
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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[440px] text-center"
      >
        <Card className="border-[var(--border)] bg-[var(--bg-primary)] shadow-sm rounded-2xl overflow-hidden p-2 sm:p-4 mb-4">
          <CardContent className="pt-8 pb-8 px-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-6"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </motion.div>
            <h2 className="font-geist font-semibold text-[1.5rem] text-[var(--text-primary)] mb-2">Email Verified!</h2>
            <p className="text-[0.95rem] text-[var(--text-secondary)] mb-8">
              Your email has been successfully verified. You can now log in to your account.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-11 text-[1rem] font-medium bg-[var(--brand-orange)] text-white shadow-sm shadow-[var(--brand-orange)]/20 transition-all duration-200 hover:bg-[#e65c00]"
            >
              Continue to Login
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[440px]"
    >
      <div className="flex flex-col items-center mb-8 text-center pt-8 md:pt-0">
        <h1 className="font-geist font-semibold text-[1.8rem] tracking-tight text-[var(--text-primary)] mb-2">
          Verify Email
        </h1>
        <p className="text-[1rem] text-[var(--text-secondary)]">
          {email ? `Code sent to ${email}` : 'Enter your 6-digit verification code'}
        </p>
      </div>

      <Card className="border-[var(--border)] bg-[var(--bg-primary)] shadow-sm rounded-2xl overflow-hidden p-2 sm:p-4 mb-8">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Verification Code */}
            <div className="space-y-2">
              <Label htmlFor="verificationCode" className="font-medium text-[0.85rem] text-[var(--text-primary)]">
                Verification Code
              </Label>
              <Input
                id="verificationCode"
                placeholder="123456"
                className="text-center text-lg tracking-widest h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors"
                maxLength={6}
                {...form.register('verificationCode')}
              />
              {form.formState.errors.verificationCode && (
                <p className="text-[0.75rem] text-destructive">{form.formState.errors.verificationCode.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="w-full h-11 text-[1rem] font-medium bg-[var(--brand-orange)] text-white shadow-sm shadow-[var(--brand-orange)]/20 hover:shadow-md hover:shadow-[var(--brand-orange)]/40 hover:bg-[#e65c00] hover:-translate-y-0.5 transition-all duration-200 mt-2"
            >
              {form.formState.isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Verify Email
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
             <p className="text-[0.85rem] text-[var(--text-muted)] mb-3">
               Didn't receive the code?
             </p>
             <Button
               variant="outline"
               onClick={handleResendCode}
               disabled={isResending || !email}
               className="w-full h-11 border-[var(--border-strong)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
             >
               {isResending ? (
                 <RefreshCw className="w-4 h-4 mr-2 animate-spin text-[var(--brand-orange)]" />
               ) : (
                 <Mail className="w-4 h-4 mr-2" />
               )}
               Resend Code
             </Button>
          </div>
        </CardContent>
      </Card>

      {/* Back to Login */}
      <div className="text-center">
        <button
          onClick={() => router.push('/login')}
          className="text-[0.95rem] text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] transition-colors"
        >
          &larr; Back to Login
        </button>
      </div>
    </motion.div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-[var(--brand-orange)]" /></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}