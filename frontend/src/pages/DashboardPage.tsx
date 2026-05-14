import { useAuthStore } from '@/store/authStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  PieChart, FileText, Library, Activity, TrendingUp, TrendingDown,
  Landmark, Scale, Receipt, ArrowUpRight, ArrowDownRight, LayoutGrid,
  Loader2, AlertCircle,
} from 'lucide-react';
import { useCompanies, Company } from '@/api/hooks/useCompanies';
import { NumberTicker } from '@/components/ui/number-ticker';
import { useDashboardSummary } from '@/api/hooks/useReports';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// ── Skeleton for loading state ───────────────────────────────────────────────
function StatSkeleton() {
  return (
    <div className="animate-pulse space-y-3 mt-2">
      <div className="h-8 bg-slate-200 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-100 rounded w-1/2" />
    </div>
  );
}

// ── Individual KPI card ──────────────────────────────────────────────────────
interface KpiCardProps {
  title: string;
  value: number;
  delay?: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  cardClassName?: string;
  isLoading: boolean;
  isError: boolean;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
  valueClassName?: string;
  currencyClassName?: string;
  currencySymbol?: string;
}

function KpiCard({
  title, value, delay = 0, icon: Icon, iconBg, iconColor,
  cardClassName, isLoading, isError, badge, footer, valueClassName, currencyClassName, currencySymbol = 'Rp'
}: KpiCardProps) {
  return (
    <Card className={cn('soft-card md:col-span-3 lg:col-span-4 row-span-1 border-border/40', cardClassName)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className={cn('text-sm font-bold uppercase tracking-widest', valueClassName ? 'text-slate-400' : 'text-slate-500')}>
          {title}
        </CardTitle>
        <div className={cn('p-2 rounded-lg', iconBg)}>
          <Icon className={cn('w-5 h-5', iconColor)} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <StatSkeleton />
        ) : isError ? (
          <div className="flex items-center gap-2 mt-2 text-slate-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>No data</span>
          </div>
        ) : (
          <>
            <div className={cn('text-3xl font-black flex items-baseline gap-1.5 mt-2', valueClassName ?? 'text-slate-900')}>
              <span className={cn('text-xl font-medium', currencyClassName ?? 'text-slate-400')}>{currencySymbol}</span>
              <NumberTicker value={value} delay={delay} />
            </div>
            {badge && <div className="flex items-center gap-2 mt-4">{badge}</div>}
            {footer}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export function DashboardPage() {
  const { user, activeCompanyId } = useAuthStore();
  const { companies } = useCompanies();
  const activeCompany = companies.find((c: Company) => c.id === activeCompanyId);

  const { data: summary, isLoading, isError } = useDashboardSummary();

  const totalAssets      = summary?.totalAssets      ?? 0;
  const totalLiabilities = summary?.totalLiabilities ?? 0;
  const netIncome        = summary?.netIncome        ?? 0;
  const totalExpenses    = summary?.totalExpenses    ?? 0;
  const totalRevenue     = summary?.totalRevenue     ?? 0;

  // Expense ratio vs revenue for the progress bar
  const expenseRatio = totalRevenue > 0 ? Math.min((totalExpenses / totalRevenue) * 100, 100) : 0;
  
  const isUSD = activeCompany?.currency === 'USD';
  const currencySymbol = isUSD ? '$' : 'Rp';
  const currencyLocale = isUSD ? 'en-US' : 'id-ID';

  return (
    <div className="animate-fade-in space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Welcome back, <span className="text-primary">{user?.username}</span>
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            {activeCompany
              ? `Here's what's happening at ${activeCompany.name} today.`
              : 'Please select or create a company to get started.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-2xl border border-border/40 shadow-sm flex items-center gap-2">
            {isLoading
              ? <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              : <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            <span className="text-sm font-medium text-slate-600">
              {isLoading ? 'Loading data…' : 'System Live'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 auto-rows-[180px]">

        {/* Main Overview Card */}
        <Card className="soft-card md:col-span-6 lg:col-span-8 row-span-2 bg-gradient-to-br from-white via-slate-50/50 to-slate-100/50 border-border/40 flex flex-col overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <LayoutGrid className="w-48 h-48" />
          </div>
          <CardHeader className="relative z-10">
            <CardTitle className="text-slate-800 flex items-center gap-2 text-2xl">
              <Activity className="w-6 h-6 text-primary" />
              SIAKSA Insights
            </CardTitle>
            <CardDescription className="text-slate-500 text-base">
              Real-time financial overview for {activeCompany?.name ?? 'your company'}.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10 flex-1 flex flex-col justify-center">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-2xl border border-border/40 bg-white/50">
                    <div className="w-11 h-11 rounded-xl bg-slate-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                      <div className="h-3 bg-slate-100 rounded w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <p className="text-slate-600 max-w-xl mb-6 text-base leading-relaxed">
                  Your accounting ecosystem is up to date.
                  {totalRevenue > 0
                    ? <> Total revenue this period is <span className="font-bold text-slate-900">{currencySymbol} {totalRevenue.toLocaleString(currencyLocale)}</span>.</>
                    : <> No transactions recorded yet for this period.</>}
                  {netIncome >= 0
                    ? <> Financial health is <span className="text-emerald-600 font-bold">Profitable</span>.</>
                    : <> The company is currently <span className="text-rose-600 font-bold">at a loss</span>.</>}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Journal Entries', sub: 'Ready to post', icon: FileText, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Reports', sub: 'Updated in real-time', icon: PieChart, color: 'bg-purple-50 text-purple-600' },
                    { label: 'Accounts', sub: 'Active & Verified', icon: Library, color: 'bg-emerald-50 text-emerald-600' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/50 border border-border/40 hover:bg-white transition-colors cursor-pointer group/item shadow-sm">
                      <div className={cn('p-3 rounded-xl transition-transform group-hover/item:scale-110', item.color)}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{item.label}</div>
                        <div className="text-xs text-slate-500">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total Assets */}
        <KpiCard
          title="Total Assets"
          value={totalAssets}
          currencySymbol={currencySymbol}
          delay={0}
          icon={Landmark}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          cardClassName="hover:border-emerald-200 transition-colors"
          isLoading={isLoading}
          isError={isError}
          badge={
            totalAssets > 0
              ? <>
                  <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    <ArrowUpRight className="w-3 h-3 mr-1" /> Active
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Balance</span>
                </>
              : <span className="text-xs text-slate-400">No assets recorded</span>
          }
        />

        {/* Total Liabilities */}
        <KpiCard
          title="Liabilities"
          value={totalLiabilities}
          currencySymbol={currencySymbol}
          delay={0.1}
          icon={Scale}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          cardClassName="hover:border-rose-200 transition-colors"
          isLoading={isLoading}
          isError={isError}
          badge={
            totalLiabilities > 0
              ? <>
                  <div className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
                    <ArrowDownRight className="w-3 h-3 mr-1" /> Outstanding
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Balance</span>
                </>
              : <span className="text-xs text-slate-400">No liabilities recorded</span>
          }
        />

        {/* Net Income — dark accent card */}
        <KpiCard
          title="Net Income"
          value={netIncome < 0 ? Math.abs(netIncome) : netIncome}
          currencySymbol={currencySymbol}
          delay={0.2}
          icon={TrendingUp}
          iconBg="bg-white/10"
          iconColor={netIncome >= 0 ? 'text-emerald-400' : 'text-rose-400'}
          cardClassName="bg-slate-900 hover:bg-slate-800 transition-colors overflow-hidden relative"
          isLoading={isLoading}
          isError={isError}
          valueClassName="text-white"
          currencyClassName="text-slate-500"
          footer={
            <p className="text-xs text-slate-400 mt-4 font-bold flex items-center gap-1">
              <Activity className="w-3 h-3" />
              {netIncome >= 0 ? 'Profitable period' : 'Operating at a loss'}
            </p>
          }
        />

        {/* Total Expenses */}
        <KpiCard
          title="Expenses"
          value={totalExpenses}
          currencySymbol={currencySymbol}
          delay={0.3}
          icon={Receipt}
          iconBg="bg-slate-100"
          iconColor="text-slate-600"
          cardClassName="hover:shadow-lg transition-all"
          isLoading={isLoading}
          isError={isError}
          footer={
            !isLoading && !isError ? (
              <div className="mt-5">
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${expenseRatio}%` }}
                    transition={{ duration: 1.4, delay: 0.6, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', expenseRatio > 80 ? 'bg-rose-400' : 'bg-slate-400')}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase">
                  {totalRevenue > 0 ? `${expenseRatio.toFixed(0)}% of total revenue` : 'No revenue to compare'}
                </p>
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}
