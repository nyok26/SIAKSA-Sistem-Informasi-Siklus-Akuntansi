import { useMemo, useState } from 'react';
import { useIncomeStatement } from '@/api/hooks/useReports';
import { DateFilter, DateRange } from '@/components/DateFilter';
import { ReportAccountingHeader } from '@/components/reports/ReportAccountingHeader';
import { useActiveCompany } from '@/api/hooks/useCompanies';
import { formatAccountingReportPeriod, reportPeriodLocaleFromCurrency } from '@/lib/reportPeriodLabel';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { PrintReportButton } from '@/components/reports/PrintReportButton';

export function IncomeStatementPage() {
  const [dateRange, setDateRange] = useState<DateRange>({});
  const { activeCompany } = useActiveCompany();
  const currency = activeCompany?.currency || 'IDR';
  const { data, isLoading } = useIncomeStatement(dateRange);

  const periodLocale = reportPeriodLocaleFromCurrency(activeCompany?.currency);
  const periodLabel = useMemo(
    () => formatAccountingReportPeriod(dateRange, periodLocale),
    [dateRange, periodLocale],
  );

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Income Statement</h1>
          <p className="text-muted-foreground mt-1">Laporan Laba Rugi.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <DateFilter onChange={setDateRange} />
          <PrintReportButton disabled={isLoading} />
        </div>
      </div>

      <Card className="print-report-root soft-card overflow-hidden">
        <ReportAccountingHeader
          companyName={activeCompany?.name ?? ''}
          reportTitle="Income Statement"
          periodLabel={periodLabel}
          className="p-8"
        />
        
        <CardContent className="p-8 space-y-8">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading report…</div>
          ) : (
            <>
              {/* Revenue Section */}
              <div>
                <h4 className="font-bold text-lg text-primary border-b border-border pb-2 mb-4">Revenues</h4>
                <div className="space-y-3 pl-4">
                  {data?.revenue.map(r => (
                    <div key={r.account_id} className="flex justify-between items-center">
                      <span className="text-foreground">{r.account_name}</span>
                      <span className="font-mono report-print-amount">{formatCurrency(r.amount, currency)}</span>
                    </div>
                  ))}
                  {data?.revenue.length === 0 && <div className="text-muted-foreground text-sm italic">No revenue recorded</div>}

                  <div className="flex justify-between items-center pt-2 border-t border-border/50 font-bold">
                    <span>Total Revenues</span>
                    <span className="font-mono text-primary report-print-amount">{formatCurrency(data?.totalRevenue || 0, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Expenses Section */}
              <div>
                <h4 className="font-bold text-lg text-destructive border-b border-border pb-2 mb-4">Expenses</h4>
                <div className="space-y-3 pl-4">
                  {data?.expenses.map(e => (
                    <div key={e.account_id} className="flex justify-between items-center">
                      <span className="text-foreground">{e.account_name}</span>
                      <span className="font-mono report-print-amount">{formatCurrency(e.amount, currency)}</span>
                    </div>
                  ))}
                  {data?.expenses.length === 0 && <div className="text-muted-foreground text-sm italic">No expenses recorded</div>}

                  <div className="flex justify-between items-center pt-2 border-t border-border/50 font-bold">
                    <span>Total Expenses</span>
                    <span className="font-mono text-destructive report-print-amount">{formatCurrency(data?.totalExpenses || 0, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Net Income Section */}
              <div className="pt-6 border-t-2 border-border">
                <div className={`report-print-total-banner flex justify-between items-center text-xl font-bold px-4 py-3 rounded-lg ${data?.netIncome! >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  <span>{data?.netIncome! >= 0 ? 'Net Income' : 'Net Loss'}</span>
                  <span className="font-mono border-b-4 border-double border-current report-print-amount">
                    {formatCurrency(Math.abs(data?.netIncome || 0), currency)}
                  </span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
