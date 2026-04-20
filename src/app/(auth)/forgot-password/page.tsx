'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Mail, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { authService } from '@/lib/api/services/auth';
import { toast } from 'sonner';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotFormData) => {
    try {
      const clientId = process.env.NEXT_PUBLIC_CLIENT_ID || '';
      await authService.forgotPassword({
        email: data.email,
        client_id: clientId,
      });

      setIsSubmitted(true);
      toast.success('Password reset link sent to your email.');
    } catch (error) {
      toast.error('Failed to send reset link. Please try again.');
    }
  };

  if (isSubmitted) {
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
            <h2 className="font-geist font-semibold text-[1.5rem] text-[var(--text-primary)] mb-2">Check your email</h2>
            <p className="text-[0.95rem] text-[var(--text-secondary)] mb-8">
              We have sent a password reset link to your email address. Click the link to reset your password.
            </p>
            <Button
              onClick={() => router.push('/login')}
              className="w-full h-11 text-[1rem] font-medium bg-[var(--text-primary)] hover:bg-[var(--text-secondary)] text-[var(--bg-primary)] shadow-sm transition-all duration-200"
            >
              Back to Login
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
          Forgot Password
        </h1>
        <p className="text-[1rem] text-[var(--text-secondary)]">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      <Card className="border-[var(--border)] bg-[var(--bg-primary)] shadow-sm rounded-2xl overflow-hidden p-2 sm:p-4 mb-8">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium text-[0.85rem] text-[var(--text-primary)]">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  className="pl-10 h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors"
                  {...form.register('email')}
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-[0.75rem] text-destructive">{form.formState.errors.email.message}</p>
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
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
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