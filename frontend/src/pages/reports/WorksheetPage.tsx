import React, { useMemo, useState } from 'react';
import { useWorksheet } from '@/api/hooks/useReports';
import { DateFilter, DateRange } from '@/components/DateFilter';
import { ReportAccountingHeader } from '@/components/reports/ReportAccountingHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { useActiveCompany } from '@/api/hooks/useCompanies';
import { formatAccountingReportPeriod, reportPeriodLocaleFromCurrency } from '@/lib/reportPeriodLabel';
import { formatCurrency } from '@/lib/utils';
import { PrintReportButton } from '@/components/reports/PrintReportButton';

export function WorksheetPage() {
  const [dateRange, setDateRange] = useState<DateRange>({});
  const { activeCompany } = useActiveCompany();
  const currency = activeCompany?.currency || 'IDR';
  const { data, isLoading } = useWorksheet(dateRange);

  const periodLocale = reportPeriodLocaleFromCurrency(activeCompany?.currency);
  const periodLabel = useMemo(
    () => formatAccountingReportPeriod(dateRange, periodLocale),
    [dateRange, periodLocale],
  );

  const formatCell = (val: number) => val === 0 ? '-' : formatCurrency(val, currency);

  return (
    <div className="animate-fade-in space-y-6 flex flex-col h-full">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">10-Column Worksheet</h1>
          <p className="text-muted-foreground mt-1">Neraca Lajur — complete end-to-end accounting overview.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <DateFilter onChange={setDateRange} />
          <PrintReportButton disabled={isLoading} />
        </div>
      </div>

      <div className="print-report-root soft-card overflow-hidden flex-1 flex flex-col min-h-0">
        <ReportAccountingHeader
          companyName={activeCompany?.name ?? ''}
          reportTitle="Worksheet (Neraca Lajur)"
          periodLabel={periodLabel}
          className="shrink-0 py-5"
        />
        
        <div className="print-worksheet-wrap flex-1 overflow-auto">
          <Table className="relative w-max min-w-full">
            <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
              <TableRow className="bg-muted/50">
                <TableHead rowSpan={2} className="border-r min-w-[250px] bg-muted/80">Account Name</TableHead>
                <TableHead colSpan={2} className="text-center border-r bg-blue-500/10">Trial Balance</TableHead>
                <TableHead colSpan={2} className="text-center border-r bg-purple-500/10">Adjustments</TableHead>
                <TableHead colSpan={2} className="text-center border-r bg-indigo-500/10">Adjusted TB</TableHead>
                <TableHead colSpan={2} className="text-center border-r bg-emerald-500/10">Income Statement</TableHead>
                <TableHead colSpan={2} className="text-center bg-rose-500/10">Balance Sheet</TableHead>
              </TableRow>
              <TableRow className="bg-muted/30">
                {Array(5).fill(0).map((_, i) => (
                  <React.Fragment key={i}>
                    <TableHead className={`text-right w-32 ${i < 4 ? 'border-r' : ''} ${i===0?'bg-blue-500/5':i===1?'bg-purple-500/5':i===2?'bg-indigo-500/5':i===3?'bg-emerald-500/5':'bg-rose-500/5'}`}>Debit</TableHead>
                    <TableHead className={`text-right w-32 border-r ${i===0?'bg-blue-500/5':i===1?'bg-purple-500/5':i===2?'bg-indigo-500/5':i===3?'bg-emerald-500/5':'bg-rose-500/5'}`}>Credit</TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={11} className="text-center py-12">Loading worksheet...</TableCell></TableRow>
              ) : data?.rows.map((row) => (
                <TableRow key={row.account_id} className="hover:bg-muted/30">
                  <TableCell className="border-r font-medium sticky left-0 bg-background/95 backdrop-blur shadow-[1px_0_0_0_hsl(var(--border))]">
                    <span className="text-muted-foreground mr-2 text-xs">{row.account_code}</span>
                    {row.account_name}
                  </TableCell>
                  
                  <TableCell className="text-right font-mono border-l border-blue-500/10">{formatCell(row.tb_debit)}</TableCell>
                  <TableCell className="text-right font-mono border-r border-blue-500/10">{formatCell(row.tb_credit)}</TableCell>
                  
                  <TableCell className="text-right font-mono bg-purple-500/5">{formatCell(row.adj_debit)}</TableCell>
                  <TableCell className="text-right font-mono bg-purple-500/5 border-r border-purple-500/10">{formatCell(row.adj_credit)}</TableCell>
                  
                  <TableCell className="text-right font-mono">{formatCell(row.adj_tb_debit)}</TableCell>
                  <TableCell className="text-right font-mono border-r border-indigo-500/10">{formatCell(row.adj_tb_credit)}</TableCell>
                  
                  <TableCell className="text-right font-mono bg-emerald-500/5">{formatCell(row.is_debit)}</TableCell>
                  <TableCell className="text-right font-mono bg-emerald-500/5 border-r border-emerald-500/10">{formatCell(row.is_credit)}</TableCell>
                  
                  <TableCell className="text-right font-mono">{formatCell(row.bs_debit)}</TableCell>
                  <TableCell className="text-right font-mono">{formatCell(row.bs_credit)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            {data && data.rows.length > 0 && (
              <TableFooter className="sticky bottom-0 z-10 bg-background border-t-2 shadow-[0_-1px_0_0_hsl(var(--border))]">
                <TableRow className="bg-muted/80 report-print-total-row">
                  <TableCell className="font-bold text-right sticky left-0 bg-muted border-r">Totals</TableCell>
                  <TableCell className="text-right font-mono font-bold text-blue-400">{formatCell(data.totals.tb_debit)}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-blue-400 border-r border-blue-500/20">{formatCell(data.totals.tb_credit)}</TableCell>
                  
                  <TableCell className="text-right font-mono font-bold text-purple-400">{formatCell(data.totals.adj_debit)}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-purple-400 border-r border-purple-500/20">{formatCell(data.totals.adj_credit)}</TableCell>
                  
                  <TableCell className="text-right font-mono font-bold text-indigo-400">{formatCell(data.totals.adj_tb_debit)}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-indigo-400 border-r border-indigo-500/20">{formatCell(data.totals.adj_tb_credit)}</TableCell>
                  
                  <TableCell className="text-right font-mono font-bold text-emerald-400">{formatCell(data.totals.is_debit)}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-400 border-r border-emerald-500/20">{formatCell(data.totals.is_credit)}</TableCell>
                  
                  <TableCell className="text-right font-mono font-bold text-rose-400">{formatCell(data.totals.bs_debit)}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-rose-400">{formatCell(data.totals.bs_credit)}</TableCell>
                </TableRow>
                <TableRow className="bg-background report-print-total-row">
                  <TableCell className="font-bold text-right sticky left-0 bg-background border-r">Net Income (Loss)</TableCell>
                  <TableCell colSpan={6} className="border-r"></TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-500">{data.net_income > 0 ? formatCurrency(data.net_income, currency) : '-'}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-emerald-500 border-r border-emerald-500/20">{data.net_income < 0 ? formatCurrency(Math.abs(data.net_income), currency) : '-'}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-rose-500">{data.net_income < 0 ? formatCurrency(Math.abs(data.net_income), currency) : '-'}</TableCell>
                  <TableCell className="text-right font-mono font-bold text-rose-500">{data.net_income > 0 ? formatCurrency(data.net_income, currency) : '-'}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </div>
    </div>
  );
}
