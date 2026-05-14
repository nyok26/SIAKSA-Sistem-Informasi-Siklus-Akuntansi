import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, BookOpenCheck, Loader2, FileText, FileClock, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '@/api/hooks/useAuth';
import { AnimatedDotPattern } from '@/components/ui/animated-dot-pattern';
import { Marquee } from '@/components/ui/marquee';
import { HighlightText } from '@/components/ui/highlight-text';
import { ShinyButton } from '@/components/ui/shiny-button';
import logoSiaksa from '@/assets/logo-siaksa.png';

const schema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormValues) => login(data);

  return (
    <div className="bg-slate-100 min-h-screen flex relative overflow-hidden">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-slate-100 border-r border-border/50 relative">
        <AnimatedDotPattern className="opacity-50" />
        <div className="w-full max-w-xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8 text-center md:text-left"
          >
            {/* Logo SIAKSA */}
            <div className="flex justify-center mb-8">
              <img
                src={logoSiaksa}
                alt="Logo SIAKSA"
                className="h-50 w-auto object-contain drop-shadow-sm"
              />
            </div>
            {/* <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">SIAKSA</h1> */}
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">Sistem Informasi Siklus Akuntansi</h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Modern Accounting Information System. Manage your complete accounting cycle efficiently.
            </p>
          </motion.div>

          {/* Interactive Bento Grid / Marquee */}
          <div
            className="relative h-[240px] w-full overflow-hidden"
            style={{ maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)" }}
          >
            <Marquee vertical className="h-full" pauseOnHover>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-border/40 soft-card select-none cursor-default">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-xl">
                    <FileText className="w-6 h-6 text-slate-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">General Journal</h3>
                    <p className="text-sm text-slate-500">Record daily transactions seamlessly</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-border/40 soft-card flex items-center gap-4 select-none cursor-default">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <FileClock className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Adjusting Entries</h3>
                  <p className="text-sm text-slate-500">Period-end accruals</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-border/40 soft-card flex items-center gap-4 select-none cursor-default">
                <div className="p-3 bg-slate-100 rounded-xl">
                  <PieChart className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Financial Reports</h3>
                  <p className="text-sm text-slate-500">Real-time insights</p>
                </div>
              </div>
            </Marquee>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-slate-100 to-transparent"></div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-slate-100 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden justify-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary">
              <BookOpenCheck className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-foreground">SIAKSA</span>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-border/40">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
                <HighlightText>Welcome back</HighlightText>
              </h2>
              <p className="text-sm text-slate-500">Sign in to your account to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="rounded-xl border-border/50 shadow-sm focus-visible:ring-primary/20 bg-slate-50"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              <ShinyButton type="submit" className="w-full h-12 text-base rounded-xl shadow-sm" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Signing in…</>
                ) : (
                  'Sign in'
                )}
              </ShinyButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
