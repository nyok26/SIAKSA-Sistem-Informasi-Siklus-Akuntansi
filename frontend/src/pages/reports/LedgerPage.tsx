import { useState } from 'react';
import { useLedger } from '@/api/hooks/useReports';
import { DateFilter, DateRange } from '@/components/DateFilter';
import { useAccounts } from '@/api/hooks/useAccounts';
import { useActiveCompany } from '@/api/hooks/useCompanies';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PrintReportButton } from '@/components/reports/PrintReportButton';

export function LedgerPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({});
  const { activeCompany } = useActiveCompany();
  const currency = activeCompany?.currency || 'IDR';
  const { data: accounts } = useAccounts();
  const { data: ledgerData, isLoading } = useLedger(selectedAccount === 'all' ? undefined : selectedAccount, dateRange);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">General Ledger</h1>
          <p className="text-muted-foreground mt-1">Detailed transaction history by account.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <DateFilter onChange={setDateRange} />
          <PrintReportButton disabled={isLoading || !ledgerData?.length} />
          <div className="w-64">
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger className="bg-white border-border/50 shadow-sm rounded-xl">
                <SelectValue placeholder="Filter by account" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts?.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.account_code} - {acc.account_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {isLoading ? (
          <div className="no-print p-8 text-center text-muted-foreground soft-card">Loading ledger data...</div>
        ) : ledgerData?.length === 0 ? (
          <div className="no-print p-12 text-center text-muted-foreground soft-card">No transactions found.</div>
        ) : (
          ledgerData?.map((account) => {
            const ledgerTotals = account.transactions.reduce(
              (sums, t) => ({
                debit: sums.debit + (t.debit || 0),
                credit: sums.credit + (t.credit || 0),
              }),
              { debit: 0, credit: 0 },
            );
            return (
            <Card key={account.account_id} className="print-ledger-card print-report-root soft-card overflow-hidden">
              <CardHeader className="bg-slate-50/50 pb-4 border-b border-border/40">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{account.account_code} - {account.account_name}</span>
                  <span className="text-sm font-normal text-muted-foreground">Normal Balance: {account.normal_balance}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-32">Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right w-32">Debit</TableHead>
                      <TableHead className="text-right w-32 report-print-credit-col">Credit</TableHead>
                      <TableHead className="text-right w-32 bg-muted/20">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {account.transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-4">No activity</TableCell>
                      </TableRow>
                    ) : (
                      account.transactions.map((t, idx) => (
                        <TableRow key={`${t.source_id}-${idx}`}>
                          <TableCell>{formatDate(t.date)}</TableCell>
                          <TableCell>{t.description}</TableCell>
                          <TableCell className="text-muted-foreground text-xs">{t.source}</TableCell>
                          <TableCell className="text-right font-mono">{t.debit > 0 ? formatCurrency(t.debit, currency) : '-'}</TableCell>
                          <TableCell className="text-right font-mono report-print-credit-col">{t.credit > 0 ? formatCurrency(t.credit, currency) : '-'}</TableCell>
                          <TableCell className="text-right font-mono bg-muted/20 font-medium">{formatCurrency(t.balance, currency)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  {account.transactions.length > 0 && (
                    <TableFooter>
                      <TableRow className="hover:bg-transparent border-t-2 border-border/60 bg-slate-100/90 report-print-total-row">
                        <TableCell colSpan={3} className="font-semibold text-slate-800 py-3">
                          Total
                        </TableCell>
                        <TableCell className="text-right font-mono py-3 font-semibold text-slate-900">
                          {formatCurrency(ledgerTotals.debit, currency)}
                        </TableCell>
                        <TableCell className="text-right font-mono py-3 font-semibold text-slate-900 report-print-credit-col">
                          {formatCurrency(ledgerTotals.credit, currency)}
                        </TableCell>
                        <TableCell className="text-right font-mono bg-muted/20 py-3 text-muted-foreground text-xs font-normal">
                          —
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  )}
                </Table>
              </CardContent>
            </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
