'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Eye, EyeOff, ArrowRight, User, Mail, Lock, Building2, Phone, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { clientsService } from '@/lib/api/services/base-operations';
import { toast } from 'sonner';

const registerSchema = z
  .object({
    adminFullName: z.string().min(2, 'Name must be at least 2 characters'),
    adminEmail: z.string().email('Please enter a valid email address'),
    contact: z.string().min(7, 'Please enter a valid contact number'),
    businessName: z.string().min(2, 'Business name must be at least 2 characters'),
    adminPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((v) => v, 'You must agree to the terms'),
  })
  .refine((data) => data.adminPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
const strengthColors = ['#E63946', '#F59E0B', '#00D9FF', '#22C55E'];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      adminFullName: '',
      adminEmail: '',
      contact: '',
      businessName: '',
      adminPassword: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const watchPassword = form.watch('adminPassword');
  const strength = getPasswordStrength(watchPassword || '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);
    try {
      await clientsService.create({
        adminFullName: data.adminFullName,
        adminEmail: data.adminEmail,
        adminPassword: data.adminPassword,
        contact: data.contact,
        businessName: data.businessName,
      });
      
      toast.success('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="w-full max-w-[500px]"
    >
      <div className="flex flex-col items-center mb-8 text-center pt-8 md:pt-0">
        <h1 className="font-geist font-semibold text-[1.8rem] tracking-tight text-[var(--text-primary)] mb-2">
          Create an account
        </h1>
        <p className="text-[1rem] text-[var(--text-secondary)]">
          Join XetiHub to start managing your WiFi networks
        </p>
      </div>

      <Card className="border-[var(--border)] bg-[var(--bg-primary)] shadow-sm rounded-2xl overflow-hidden p-2 sm:p-4 mb-12">
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Full Name */}
              <div className="space-y-2">
                <Label htmlFor="adminFullName" className="font-medium text-[0.85rem] text-[var(--text-primary)]">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input
                    id="adminFullName"
                    placeholder="John Doe"
                    className="pl-10 h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors"
                    {...form.register('adminFullName')}
                  />
                </div>
                {form.formState.errors.adminFullName && (
                  <p className="text-[0.75rem] text-destructive">{form.formState.errors.adminFullName.message}</p>
                )}
              </div>

              {/* Admin Email */}
              <div className="space-y-2">
                <Label htmlFor="adminEmail" className="font-medium text-[0.85rem] text-[var(--text-primary)]">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input
                    id="adminEmail"
                    type="email"
                    placeholder="john@company.com"
                    className="pl-10 h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors"
                    {...form.register('adminEmail')}
                  />
                </div>
                {form.formState.errors.adminEmail && (
                  <p className="text-[0.75rem] text-destructive">{form.formState.errors.adminEmail.message}</p>
                )}
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <Label htmlFor="contact" className="font-medium text-[0.85rem] text-[var(--text-primary)]">Contact Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="pl-10 h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors"
                    {...form.register('contact')}
                  />
                </div>
                {form.formState.errors.contact && (
                  <p className="text-[0.75rem] text-destructive">{form.formState.errors.contact.message}</p>
                )}
              </div>

              {/* Business Name */}
              <div className="space-y-2">
                <Label htmlFor="businessName" className="font-medium text-[0.85rem] text-[var(--text-primary)]">Business Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input
                    id="businessName"
                    placeholder="Acme Telecom"
                    className="pl-10 h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors"
                    {...form.register('businessName')}
                  />
                </div>
                {form.formState.errors.businessName && (
                  <p className="text-[0.75rem] text-destructive">{form.formState.errors.businessName.message}</p>
                )}
              </div>
            </div>

            {/* Admin Password */}
            <div className="space-y-2 pt-2">
              <Label htmlFor="adminPassword" className="font-medium text-[0.85rem] text-[var(--text-primary)]">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  id="adminPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  className="pl-10 pr-10 h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors"
                  {...form.register('adminPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Strength indicator */}
              {watchPassword && (
                <div className="flex items-center gap-2 pt-1 border-b border-transparent">
                  <div className="flex gap-1 flex-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-colors duration-300"
                        style={{
                          backgroundColor: i < strength ? strengthColors[strength - 1] : 'var(--border)',
                        }}
                      />
                    ))}
                  </div>
                  <span
                    className="text-[0.65rem] font-mono uppercase tracking-wider min-w-[40px] text-right"
                    style={{ color: strengthColors[strength - 1] || 'var(--text-muted)' }}
                  >
                    {strength > 0 ? strengthLabels[strength - 1] : ''}
                  </span>
                </div>
              )}
              {form.formState.errors.adminPassword && (
                <p className="text-[0.75rem] text-destructive">{form.formState.errors.adminPassword.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="font-medium text-[0.85rem] text-[var(--text-primary)]">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  className="pl-10 pr-10 h-11 bg-[var(--bg-primary)] border-[var(--border-strong)] focus-visible:ring-[var(--brand-orange)] transition-colors"
                  {...form.register('confirmPassword')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-[0.75rem] text-destructive">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 pt-2 pb-2">
              <Checkbox
                id="agreeTerms"
                checked={form.watch('agreeTerms')}
                onCheckedChange={(checked) => form.setValue('agreeTerms', checked as boolean)}
                className="mt-0.5 border-[var(--border-strong)] data-[state=checked]:bg-[var(--brand-orange)] data-[state=checked]:border-[var(--brand-orange)]"
              />
              <Label htmlFor="agreeTerms" className="text-[0.85rem] text-[var(--text-secondary)] leading-snug cursor-pointer">
                I agree to the{' '}
                <a href="/terms" className="text-[var(--text-primary)] font-medium hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-[var(--text-primary)] font-medium hover:underline">Privacy Policy</a>
              </Label>
            </div>
            {form.formState.errors.agreeTerms && (
              <p className="text-[0.75rem] text-destructive">{form.formState.errors.agreeTerms.message}</p>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
                {error}
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-[1rem] font-medium bg-[var(--brand-orange)] text-white shadow-sm shadow-[var(--brand-orange)]/20 hover:shadow-md hover:shadow-[var(--brand-orange)]/40 hover:bg-[#e65c00] hover:-translate-y-0.5 transition-all duration-200 mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <p className="text-center text-[0.95rem] text-[var(--text-secondary)] mt-8">
        Already have an account?{' '}
        <button
          onClick={() => router.push('/login')}
          className="text-[var(--text-primary)] font-medium hover:underline underline-offset-4"
        >
          Sign in instead
        </button>
      </p>
    </motion.div>
  );
}
