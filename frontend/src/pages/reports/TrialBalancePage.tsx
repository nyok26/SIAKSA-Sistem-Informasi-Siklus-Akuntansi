import { useMemo, useState } from 'react';
import { useTrialBalance } from '@/api/hooks/useReports';
import { DateFilter, DateRange } from '@/components/DateFilter';
import { ReportAccountingHeader } from '@/components/reports/ReportAccountingHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useActiveCompany } from '@/api/hooks/useCompanies';
import { formatAccountingReportPeriod, reportPeriodLocaleFromCurrency } from '@/lib/reportPeriodLabel';
import { downloadTrialBalanceExcel } from '@/lib/exportTrialBalanceExcel';
import { formatCurrency, printReport } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { PrintReportButton } from '@/components/reports/PrintReportButton';

export function TrialBalancePage() {
  const [adjusted, setAdjusted] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({});
  const { activeCompany } = useActiveCompany();
  const currency = activeCompany?.currency || 'IDR';
  const { data, isLoading } = useTrialBalance(adjusted, dateRange);

  const periodLocale = reportPeriodLocaleFromCurrency(activeCompany?.currency);
  const periodLabel = useMemo(
    () => formatAccountingReportPeriod(dateRange, periodLocale),
    [dateRange, periodLocale],
  );

  const handleDownloadExcel = () => {
    if (!data?.rows.length) {
      toast.error('No data to export');
      return;
    }
    const rangeTag =
      dateRange.startDate && dateRange.endDate
        ? `${dateRange.startDate}_${dateRange.endDate}`
        : 'all-time';
    downloadTrialBalanceExcel({
      companyName: activeCompany?.name ?? '',
      reportTitle: `${adjusted ? 'Adjusted' : 'Unadjusted'} Trial Balance`,
      periodLabel,
      rows: data.rows.map((r) => ({
        account_code: r.account_code,
        account_name: r.account_name,
        debit_balance: r.debit_balance,
        credit_balance: r.credit_balance,
      })),
      totalDebit: data.totals.total_debit,
      totalCredit: data.totals.total_credit,
      fileBaseName: `TrialBalance_${adjusted ? 'Adj' : 'Unadj'}_${rangeTag}`,
    });
    toast.success('Excel file downloaded');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Trial Balance</h1>
          <p className="text-muted-foreground mt-1">Verify that total debits equal total credits.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <DateFilter onChange={setDateRange} />
          <PrintReportButton disabled={!data?.rows.length} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-border/50 bg-white shadow-sm"
            disabled={!data?.rows.length}
            onClick={() => printReport()}
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-border/50 bg-white shadow-sm"
            disabled={!data?.rows.length}
            onClick={handleDownloadExcel}
          >
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <div className="flex bg-slate-100 p-1 rounded-xl border border-border/50 shadow-sm">
            <Button
              variant={!adjusted ? "default" : "ghost"}
              size="sm"
              onClick={() => setAdjusted(false)}
              className="rounded-lg"
            >
              Unadjusted
            </Button>
            <Button
              variant={adjusted ? "default" : "ghost"}
              size="sm"
              onClick={() => setAdjusted(true)}
              className="rounded-lg"
            >
              Adjusted
            </Button>
          </div>
        </div>
      </div>

      <div className="print-report-root soft-card overflow-hidden">
        <ReportAccountingHeader
          companyName={activeCompany?.name ?? ''}
          reportTitle={`${adjusted ? 'Adjusted' : 'Unadjusted'} Trial Balance`}
          periodLabel={periodLabel}
        />
        
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-24">Account No.</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead className="text-right w-48">Debit</TableHead>
              <TableHead className="text-right w-48 report-print-credit-col">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">Loading...</TableCell></TableRow>
            ) : data?.rows.length === 0 ? (
              <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No accounts with balances found.</TableCell></TableRow>
            ) : (
              data?.rows.map((row) => (
                <TableRow key={row.account_id}>
                  <TableCell className="font-medium text-muted-foreground">{row.account_code}</TableCell>
                  <TableCell>{row.account_name}</TableCell>
                  <TableCell className="text-right font-mono">{row.debit_balance > 0 ? formatCurrency(row.debit_balance, currency) : '-'}</TableCell>
                  <TableCell className="text-right font-mono report-print-credit-col">{row.credit_balance > 0 ? formatCurrency(row.credit_balance, currency) : '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          {data && data.rows.length > 0 && (
            <TableFooter>
              <TableRow className="bg-primary/10 hover:bg-primary/10 report-print-total-row">
                <TableCell colSpan={2} className="text-right font-bold text-foreground">Total</TableCell>
                <TableCell className="text-right font-mono font-bold text-primary border-double border-t-4 border-b-4 border-primary/40">
                  {formatCurrency(data.totals.total_debit, currency)}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-primary border-double border-t-4 border-b-4 border-primary/40 report-print-credit-col">
                  {formatCurrency(data.totals.total_credit, currency)}
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>

        {data && data.totals.total_debit === data.totals.total_credit && data.rows.length > 0 && (
          <div className="no-print bg-green-500/10 text-green-500 text-sm font-medium p-3 flex justify-center items-center gap-2">
            <Check className="w-4 h-4" /> Trial Balance is fully balanced
          </div>
        )}
      </div>
    </div>
  );
}
