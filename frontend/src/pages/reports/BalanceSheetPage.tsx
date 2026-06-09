import { useMemo, useState } from 'react';
import { useBalanceSheet } from '@/api/hooks/useReports';
import { DateFilter, DateRange } from '@/components/DateFilter';
import { ReportAccountingHeader } from '@/components/reports/ReportAccountingHeader';
import { useActiveCompany } from '@/api/hooks/useCompanies';
import { formatAccountingReportPeriod, reportPeriodLocaleFromCurrency } from '@/lib/reportPeriodLabel';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { PrintReportButton } from '@/components/reports/PrintReportButton';

export function BalanceSheetPage() {
  const [dateRange, setDateRange] = useState<DateRange>({});
  const { activeCompany } = useActiveCompany();
  const currency = activeCompany?.currency || 'IDR';
  const { data, isLoading } = useBalanceSheet(dateRange);

  const formatEquityAmount = (amount: number) => {
    if (amount < 0) {
      return `(${formatCurrency(Math.abs(amount), currency)})`;
    }
    return formatCurrency(amount, currency);
  };

  const periodLocale = reportPeriodLocaleFromCurrency(activeCompany?.currency);
  const periodLabel = useMemo(
    () => formatAccountingReportPeriod(dateRange, periodLocale),
    [dateRange, periodLocale],
  );

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Balance Sheet</h1>
          <p className="text-muted-foreground mt-1">Laporan Posisi Keuangan (Neraca).</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <DateFilter onChange={setDateRange} />
          <PrintReportButton disabled={isLoading} />
        </div>
      </div>

      <Card className="print-report-root soft-card overflow-hidden">
        <ReportAccountingHeader
          companyName={activeCompany?.name ?? ''}
          reportTitle="Balance Sheet"
          periodLabel={periodLabel}
          className="p-8"
        />

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading report…</div>
          ) : (
            <div className="print-balance-grid grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-border">
              {/* LEFT: Assets */}
              <div className="p-8 space-y-8">
                <div>
                  <h4 className="font-bold text-lg text-blue-400 border-b border-border pb-2 mb-4">Assets</h4>
                  <div className="space-y-3 pl-4">
                    {data?.assets.map(a => (
                      <div key={a.account_id} className="flex justify-between items-center gap-4">
                        <span className="text-foreground">{a.account_name}</span>
                        <span className="font-mono report-print-amount">{formatCurrency(a.amount, currency)}</span>
                      </div>
                    ))}
                    {data?.assets.length === 0 && <div className="text-muted-foreground text-sm italic">No assets recorded</div>}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t-2 border-border font-bold text-lg text-blue-400 report-print-total-banner">
                  <span>Total Assets</span>
                  <span className="font-mono border-b-4 border-double border-current report-print-amount">
                    {formatCurrency(data?.totalAssets || 0, currency)}
                  </span>
                </div>
              </div>

              {/* RIGHT: Liabilities & Equity */}
              <div className="p-8 flex flex-col justify-between">
                <div className="space-y-8">
                  <div>
                    <h4 className="font-bold text-lg text-orange-400 border-b border-border pb-2 mb-4">Liabilities</h4>
                    <div className="space-y-3 pl-4">
                      {data?.liabilities.map(l => (
                        <div key={l.account_id} className="flex justify-between items-center gap-4">
                          <span className="text-foreground">{l.account_name}</span>
                          <span className="font-mono report-print-amount">{formatCurrency(l.amount, currency)}</span>
                        </div>
                      ))}
                      {data?.liabilities.length === 0 && <div className="text-muted-foreground text-sm italic">No liabilities recorded</div>}
                      <div className="flex justify-between items-center pt-2 font-bold gap-4">
                        <span>Total Liabilities</span>
                        <span className="font-mono report-print-amount">{formatCurrency(data?.totalLiabilities || 0, currency)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-purple-400 border-b border-border pb-2 mb-4">Equity</h4>
                    <div className="space-y-3 pl-4">
                      {data?.equity.map(e => (
                        <div key={e.account_id} className="flex justify-between items-center gap-4">
                          <span className="text-foreground">
                            {e.amount < 0 ? `Less: ${e.account_name}` : e.account_name}
                          </span>
                          <span className="font-mono report-print-amount">
                            {formatEquityAmount(e.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-foreground italic">Add: Net Income</span>
                        <span className="font-mono report-print-amount">{formatCurrency(data?.netIncome || 0, currency)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 font-bold gap-4">
                        <span>Total Equity</span>
                        <span className="font-mono report-print-amount">{formatCurrency(data?.totalEquity || 0, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t-2 border-border font-bold text-lg text-orange-400 mt-8 report-print-total-banner gap-4">
                  <span>Total Liabilities & Equity</span>
                  <span className="font-mono border-b-4 border-double border-current report-print-amount">
                    {formatCurrency(data?.totalLiabilitiesAndEquity || 0, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.totalAssets !== data.totalLiabilitiesAndEquity && (
        <div className="no-print p-4 bg-destructive/10 text-destructive rounded-lg font-medium text-center border border-destructive/20 shadow-lg">
          Warning: Balance Sheet is out of balance. Check your journal entries and normal balances.
        </div>
      )}
    </div>
  );
}
