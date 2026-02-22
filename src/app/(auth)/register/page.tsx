'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Eye, EyeOff, ArrowRight, Shield, Zap,
  Globe, Activity, Check, User, Mail, Lock, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/common';
import { cn } from '@/lib/utils';

const OrbitalScene = dynamic(() => import('@/components/three/OrbitalScene'), {
  ssr: false,
  loading: () => null,
});

/* ─── SCHEMA ─── */

const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    company: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((v) => v, 'You must agree to the terms'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/* ─── PARTICLES ─── */

function generateParticles() {
  const nodes = [...Array(15)].map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    duration: 3 + Math.random() * 2,
    delay: Math.random() * 2,
  }));
  const lines = [...Array(8)].map((_, i) => ({
    id: i,
    width: 100 + Math.random() * 200,
    left: Math.random() * 80,
    top: Math.random() * 100,
    rotate: Math.random() * 360,
    duration: 4 + Math.random() * 3,
    delay: Math.random() * 3,
  }));
  return { nodes, lines };
}

function NetworkParticles() {
  const { nodes, lines } = useMemo(() => generateParticles(), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full opacity-10">
        <defs>
          <pattern id="reg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#reg-grid)" />
      </svg>
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute w-2 h-2 bg-primary/40 rounded-full"
          style={{ left: `${node.left}%`, top: `${node.top}%` }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.5, 1] }}
          transition={{ duration: node.duration, repeat: Infinity, delay: node.delay }}
        />
      ))}
      {lines.map((line) => (
        <motion.div
          key={`line-${line.id}`}
          className="absolute h-px bg-linear-to-r from-transparent via-primary/30 to-transparent"
          style={{
            width: `${line.width}px`,
            left: `${line.left}%`,
            top: `${line.top}%`,
            rotate: `${line.rotate}deg`,
          }}
          animate={{ opacity: [0, 0.5, 0], x: [0, 50, 0] }}
          transition={{ duration: line.duration, repeat: Infinity, delay: line.delay }}
        />
      ))}
    </div>
  );
}

/* ─── FEATURES ─── */

const features = [
  { icon: Shield, label: 'Enterprise Security', description: 'Zero-trust architecture' },
  { icon: Zap, label: 'Real-time Control', description: 'Sub-millisecond latency' },
  { icon: Globe, label: 'Global Scale', description: 'Millions of endpoints' },
  { icon: Activity, label: 'AI Intelligence', description: 'Predictive analytics' },
];

/* ─── PASSWORD STRENGTH ─── */

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

/* ─── PAGE ─── */

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      company: '',
      password: '',
      confirmPassword: '',
      agreeTerms: false,
    },
  });

  const watchPassword = form.watch('password');
  const strength = getPasswordStrength(watchPassword || '');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1500));
    setIsLoading(false);
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative bg-gradient-to-br from-background via-background to-muted/50 overflow-hidden"
      >
        <NetworkParticles />

        {/* 3D Orbital Background */}
        <OrbitalScene
          className="absolute inset-0 opacity-40 pointer-events-none"
          primaryColor="#FF6A00"
          secondaryColor="#00D9FF"
        />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <div>
            <Logo className="w-10 h-10" />
            <div className="mt-1">
              <span className="text-xl font-semibold tracking-tight">
                Net<span className="text-primary">Net</span>
              </span>
            </div>
          </div>

          {/* Center content */}
          <div className="max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold tracking-tight leading-[1.1] mb-6">
                Start commanding
                <span className="text-primary block mt-1">your registry.</span>
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Create your account and get instant access to the most powerful 
                telecom financial infrastructure platform.
              </p>
            </motion.div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, i) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50"
                >
                  <feature.icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{feature.label}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center gap-6 text-xs text-muted-foreground">
            <span>SOC 2 Certified</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>ISO 27001</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>PCI DSS L1</span>
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
              Net<span className="text-primary">Net</span>
            </span>
          </div>

          <Card className="border-border/50 shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Create your account
              </CardTitle>
              <CardDescription>
                Fill in your details to get started with XETIHUB
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      className="pl-10"
                      {...form.register('fullName')}
                    />
                  </div>
                  {form.formState.errors.fullName && (
                    <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Work Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@company.com"
                      className="pl-10"
                      {...form.register('email')}
                    />
                  </div>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">
                    Company <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="company"
                      placeholder="Acme Telecom"
                      className="pl-10"
                      {...form.register('company')}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 8 characters"
                      className="pl-10 pr-10"
                      {...form.register('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {/* Strength indicator */}
                  {watchPassword && (
                    <div className="flex items-center gap-2">
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
                        className="text-[10px] font-mono uppercase tracking-wider"
                        style={{ color: strengthColors[strength - 1] || 'var(--muted-foreground)' }}
                      >
                        {strength > 0 ? strengthLabels[strength - 1] : ''}
                      </span>
                    </div>
                  )}
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Repeat your password"
                      className="pl-10 pr-10"
                      {...form.register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowConfirm(!showConfirm)}
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive">{form.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start gap-2 pt-1">
                  <Checkbox
                    id="agreeTerms"
                    checked={form.watch('agreeTerms')}
                    onCheckedChange={(checked) => form.setValue('agreeTerms', checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                  </Label>
                </div>
                {form.formState.errors.agreeTerms && (
                  <p className="text-xs text-destructive">{form.formState.errors.agreeTerms.message}</p>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold tracking-wide transition-all duration-300 hover:shadow-lg hover:shadow-primary/25"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <motion.div
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  ) : (
                    <span className="flex items-center gap-2">
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Already have an account?</span>
                </div>
              </div>

              {/* Login link */}
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => router.push('/login')}
              >
                Sign in instead
              </Button>
            </CardContent>
          </Card>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Protected by enterprise-grade encryption.
            <br />
            Your data never leaves our SOC 2 certified infrastructure.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
