import { useMemo, useState } from 'react';
import { useStatementOfEquity } from '@/api/hooks/useReports';
import { DateFilter, DateRange } from '@/components/DateFilter';
import { ReportAccountingHeader } from '@/components/reports/ReportAccountingHeader';
import { useActiveCompany } from '@/api/hooks/useCompanies';
import { formatAccountingReportPeriod, reportPeriodLocaleFromCurrency } from '@/lib/reportPeriodLabel';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { PrintReportButton } from '@/components/reports/PrintReportButton';

export function StatementOfEquityPage() {
  const [dateRange, setDateRange] = useState<DateRange>({});
  const { activeCompany } = useActiveCompany();
  const currency = activeCompany?.currency || 'IDR';
  const { data, isLoading } = useStatementOfEquity(dateRange);

  const periodLocale = reportPeriodLocaleFromCurrency(activeCompany?.currency);
  const periodLabel = useMemo(
    () => formatAccountingReportPeriod(dateRange, periodLocale),
    [dateRange, periodLocale],
  );

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Statement of Changes in Equity</h1>
          <p className="text-muted-foreground mt-1">Shows changes in owner's equity for the period.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <DateFilter onChange={setDateRange} />
          <PrintReportButton disabled={isLoading} />
        </div>
      </div>

      <Card className="print-report-root soft-card overflow-hidden">
        <ReportAccountingHeader
          companyName={activeCompany?.name ?? ''}
          reportTitle="Statement of Changes in Equity"
          periodLabel={periodLabel}
          className="p-8"
        />

        <CardContent className="p-8 space-y-8">
          {isLoading ? (
            <div className="py-16 text-center text-muted-foreground">Loading report…</div>
          ) : (
            <>
              {/* Equity Section */}
              <div>
                <h4 className="font-bold text-lg text-purple-400 border-b border-border pb-2 mb-4">Owner's Equity</h4>
                <div className="space-y-3 pl-4">
                  {/* Capital, Beginning Balance */}
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-foreground">Capital, Beginning Balance</span>
                    <span className="font-mono report-print-amount">
                      {formatCurrency(data?.initialCapital ?? 0, currency)}
                    </span>
                  </div>

                  {/* Add: Owner Contributions */}
                  {(data?.ownerContributions ?? 0) > 0 && (
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-foreground">Add: Owner Contributions</span>
                      <span className="font-mono report-print-amount">
                        {formatCurrency(data!.ownerContributions, currency)}
                      </span>
                    </div>
                  )}

                  {/* Add: Net Income */}
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-foreground">Add: Net Income</span>
                    <span className="font-mono report-print-amount">
                      {formatCurrency(data?.netIncome ?? 0, currency)}
                    </span>
                  </div>

                  {/* Less: Owner's Drawings */}
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-foreground">Less: Owner's Drawings</span>
                    <span className="font-mono report-print-amount">
                      {data?.prive ? `(${formatCurrency(data.prive, currency)})` : formatCurrency(0, currency)}
                    </span>
                  </div>

                  {/* Net Increase/Decrease - Subtotal */}
                  <div className="flex justify-between items-center pt-2 border-t border-border/50 font-bold gap-4">
                    <span>
                      {data && data.capitalChange >= 0
                        ? 'Net Increase in Equity'
                        : 'Net Decrease in Equity'}
                    </span>
                    <span className="font-mono report-print-amount">
                      {(data?.capitalChange ?? 0) < 0
                        ? `(${formatCurrency(Math.abs(data!.capitalChange), currency)})`
                        : formatCurrency(data?.capitalChange ?? 0, currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Final Capital - Grand Total */}
              <div className="pt-6 border-t-2 border-border">
                <div className="flex justify-between items-center text-xl font-bold px-4 py-3 rounded-lg bg-purple-500/10 text-purple-400 report-print-total-banner gap-4">
                  <span>Capital, Ending Balance</span>
                  <span className="font-mono border-b-4 border-double border-current report-print-amount">
                    {formatCurrency(data?.finalCapital ?? 0, currency)}
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
