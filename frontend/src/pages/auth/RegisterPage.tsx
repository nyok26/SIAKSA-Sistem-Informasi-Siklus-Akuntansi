import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, BookOpenCheck, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '@/api/hooks/useAuth';
import { AnimatedDotPattern } from '@/components/ui/animated-dot-pattern';
import { HighlightText } from '@/components/ui/highlight-text';
import { ShinyButton } from '@/components/ui/shiny-button';
import logoSiaksa from '@/assets/logo-siaksa.png';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});
type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: register_, isPending } = useRegister();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => register_(data);

  return (
    <div className="bg-slate-100 min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <AnimatedDotPattern className="opacity-50" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <img
            src={logoSiaksa}
            alt="Logo SIAKSA"
            className="h-30 w-auto object-contain drop-shadow-sm"
          />
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-border/40 relative z-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
              <HighlightText>Create an account</HighlightText>
            </h2>
            <p className="text-sm text-slate-500">
              Join SIAKSA to start managing your accounting cycle
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="reg-email" className="text-sm font-medium">Email address</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className="rounded-xl border-border/50 shadow-sm focus-visible:ring-primary/20 bg-slate-50"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="reg-username" className="text-sm font-medium">Username</Label>
              <Input
                id="reg-username"
                type="text"
                placeholder="johndoe"
                autoComplete="username"
                className="rounded-xl border-border/50 shadow-sm focus-visible:ring-primary/20 bg-slate-50"
                {...register('username')}
                aria-invalid={!!errors.username}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-sm font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="pr-10 rounded-xl border-border/50 shadow-sm focus-visible:ring-primary/20 bg-slate-50"
                  {...register('password')}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <ShinyButton type="submit" className="w-full h-12 text-base rounded-xl shadow-sm" disabled={isPending}>
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Creating account…</>
              ) : (
                'Create account'
              )}
            </ShinyButton>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
