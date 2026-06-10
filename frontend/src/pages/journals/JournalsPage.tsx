import React, { useMemo, useState } from 'react';
import { useJournals, useCreateJournal, useDeleteJournal } from '@/api/hooks/useJournals';
import { useAccounts } from '@/api/hooks/useAccounts';
import { useActiveCompany } from '@/api/hooks/useCompanies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, AlertCircle, Download, FileText } from 'lucide-react';
import { formatCurrency, formatDate, printReport } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { PrintReportButton } from '@/components/reports/PrintReportButton';
import { ReportAccountingHeader } from '@/components/reports/ReportAccountingHeader';
import { downloadJournalExcel } from '@/lib/exportJournalExcel';
import { toast } from 'sonner';

const MONTHS = [
  { value: '01', label: 'January' }, { value: '02', label: 'February' },
  { value: '03', label: 'March' }, { value: '04', label: 'April' },
  { value: '05', label: 'May' }, { value: '06', label: 'June' },
  { value: '07', label: 'July' }, { value: '08', label: 'August' },
  { value: '09', label: 'September' }, { value: '10', label: 'October' },
  { value: '11', label: 'November' }, { value: '12', label: 'December' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => String(CURRENT_YEAR - 5 + i));

export function JournalsPage() {
  const { activeCompany } = useActiveCompany();
  const currency = activeCompany?.currency || 'IDR';

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [year, month] = selectedMonth.split('-');
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const endDate = `${year}-${month}-${lastDay}`;

  const { data: journals, isLoading } = useJournals(startDate, endDate);
  const { data: accounts } = useAccounts();
  const { mutate: createJournal, isPending } = useCreateJournal();
  const { mutate: deleteJournal } = useDeleteJournal();

  const [isOpen, setIsOpen] = useState(false);
  const [deleteData, setDeleteData] = useState<{id: string, description: string} | null>(null);
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], description: '' });
  const [details, setDetails] = useState([{ account_id: '', debit: 0, credit: 0 }, { account_id: '', debit: 0, credit: 0 }]);

  const addRow = () => setDetails([...details, { account_id: '', debit: 0, credit: 0 }]);
  const removeRow = (idx: number) => setDetails(details.filter((_, i) => i !== idx));

  const updateDetail = (idx: number, field: 'account_id' | 'debit' | 'credit', value: any) => {
    const newDetails = [...details];
    const row = { ...newDetails[idx] };

    if (field === 'debit') {
      row.debit = value ? Number(value) : 0;
      // Enforce mutual exclusivity: clear credit when debit is filled
      if (row.debit > 0) row.credit = 0;
    } else if (field === 'credit') {
      row.credit = value ? Number(value) : 0;
      // Enforce mutual exclusivity: clear debit when credit is filled
      if (row.credit > 0) row.debit = 0;
    } else {
      (row as any)[field] = value;
    }

    newDetails[idx] = row;
    setDetails(newDetails);
  };

  const totalDebit = details.reduce((sum, d) => sum + (Number(d.debit) || 0), 0);
  const totalCredit = details.reduce((sum, d) => sum + (Number(d.credit) || 0), 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const journalListTotals = useMemo(() => {
    if (!journals?.length) return { debit: 0, credit: 0 };
    return journals.reduce(
      (sums, entry) => {
        for (const d of entry.details) {
          sums.debit += Number(d.debit) || 0;
          sums.credit += Number(d.credit) || 0;
        }
        return sums;
      },
      { debit: 0, credit: 0 },
    );
  }, [journals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced) return;
    createJournal(
      { ...formData, details: details.map(d => ({ account_id: d.account_id, debit: Number(d.debit), credit: Number(d.credit) })) },
      { onSuccess: () => { setIsOpen(false); setDetails([{ account_id: '', debit: 0, credit: 0 }, { account_id: '', debit: 0, credit: 0 }]); setFormData({ date: new Date().toISOString().split('T')[0], description: '' }) } }
    );
  };

  const handleDownloadExcel = () => {
    if (!journals?.length) {
      toast.error('No data to export');
      return;
    }

    const periodLabel = `${MONTHS.find((m) => m.value === month)?.label} ${year}`;
    const rows = journals.flatMap((entry) =>
      entry.details.map((d) => ({
        date: formatDate(entry.date),
        account_code: d.account?.account_code || '',
        account_name: d.account?.account_name || '',
        description: entry.description || '',
        debit: d.debit,
        credit: d.credit,
      }))
    );

    downloadJournalExcel({
      companyName: activeCompany?.name ?? '',
      reportTitle: 'General Journal',
      periodLabel,
      rows,
      totalDebit: journalListTotals.debit,
      totalCredit: journalListTotals.credit,
      fileBaseName: `GeneralJournal_${year}_${month}`,
    });
    toast.success('Excel file downloaded');
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="no-print flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">General Journal</h1>
          <p className="text-muted-foreground mt-1">Record day-to-day transactions.</p>
        </div>
        <div className="flex items-center gap-3">
          <PrintReportButton disabled={!journals?.length} />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-border/50 bg-white shadow-sm"
            disabled={!journals?.length}
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
            disabled={!journals?.length}
            onClick={handleDownloadExcel}
          >
            <Download className="h-4 w-4" />
            Excel
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> New Entry</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Journal Entry</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Transaction description" required />
                  </div>
                </div>

                <div className="border rounded-md p-4 space-y-4 bg-secondary/10">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Line Items</h4>
                    <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1"><Plus className="w-3 h-3" /> Add Row</Button>
                  </div>
                  {details.map((d, idx) => (
                    <div key={idx} className="flex items-end gap-3">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs text-slate-600">Account</Label>
                        <Select value={d.account_id} onValueChange={(v) => updateDetail(idx, 'account_id', v)}>
                          <SelectTrigger><SelectValue placeholder="Select account" /></SelectTrigger>
                          <SelectContent>
                            {accounts?.map(acc => (
                              <SelectItem key={acc.id} value={acc.id}>{acc.account_code} - {acc.account_name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {/* Debit — disabled when credit > 0 */}
                      <div className="w-32 space-y-1">
                        <Label className={`text-xs font-semibold ${d.credit > 0 ? 'text-slate-400' : 'text-emerald-700'}`}>
                          Debit {d.credit > 0 && <span className="font-normal">(locked)</span>}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={d.debit || ''}
                          onChange={(e) => updateDetail(idx, 'debit', e.target.value)}
                          disabled={d.credit > 0}
                          className={d.credit > 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white focus:ring-emerald-300'}
                          placeholder="0"
                        />
                      </div>
                      {/* Credit — disabled when debit > 0 */}
                      <div className="w-32 space-y-1">
                        <Label className={`text-xs font-semibold ${d.debit > 0 ? 'text-slate-400' : 'text-rose-700'}`}>
                          Credit {d.debit > 0 && <span className="font-normal">(locked)</span>}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={d.credit || ''}
                          onChange={(e) => updateDetail(idx, 'credit', e.target.value)}
                          disabled={d.debit > 0}
                          className={d.debit > 0 ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white focus:ring-rose-300'}
                          placeholder="0"
                        />
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeRow(idx)} disabled={details.length <= 2} className="shrink-0 text-destructive mb-[1px]">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex justify-end gap-6 pt-4 border-t border-border mt-4">
                    <div className="text-sm"><span className="text-muted-foreground mr-2">Total Debit:</span><span className="font-mono font-medium">{formatCurrency(totalDebit, currency)}</span></div>
                    <div className="text-sm"><span className="text-muted-foreground mr-2">Total Credit:</span><span className="font-mono font-medium">{formatCurrency(totalCredit, currency)}</span></div>
                  </div>
                  {!isBalanced && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                      <AlertCircle className="w-4 h-4" /> Totals must balance and be greater than 0 to submit.
                    </div>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={!isBalanced || isPending}>Save Journal Entry</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="print-report-root soft-card shadow-sm overflow-hidden border border-border/40">
        <ReportAccountingHeader
          companyName={activeCompany?.name ?? ''}
          reportTitle="General Journal"
          periodLabel={`${MONTHS.find((m) => m.value === month)?.label} ${year}`}
        />
        <div className="no-print p-4 border-b border-border/40 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <Label className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              Filter Period:
            </Label>

            <div className="flex items-center gap-2">
              {/* Dropdown Bulan */}
              <Select
                value={month}
                onValueChange={(v) => setSelectedMonth(`${year}-${v}`)}
              >
                <SelectTrigger className="w-[140px] bg-white rounded-xl shadow-sm border-border/50">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {MONTHS.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Dropdown Tahun */}
              <Select
                value={year}
                onValueChange={(v) => setSelectedMonth(`${v}-${month}`)}
              >
                <SelectTrigger className="w-[100px] bg-white rounded-xl shadow-sm border-border/50">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead className="w-32 pl-6">Date</TableHead>
              <TableHead>Account Title</TableHead>
              <TableHead className="w-24">Ref</TableHead>
              <TableHead className="text-right w-40">Debit</TableHead>
              <TableHead className="text-right w-40 pr-6">Credit</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">Loading journal entries...</TableCell></TableRow>
            ) : journals?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No journal entries found for this period.</TableCell></TableRow>
            ) : (
              journals?.map((entry) => (
                <React.Fragment key={entry.id}>
                  {entry.details.map((d, i) => (
                    <TableRow key={`${entry.id}-${i}`} className="hover:bg-slate-50/50 border-0 group">
                      <TableCell className="pl-6 font-medium text-slate-700 align-top pt-3 border-0">
                        {i === 0 ? formatDate(entry.date) : ''}
                      </TableCell>
                      <TableCell className={`align-top pt-3 border-0 ${d.credit > 0 ? 'pl-8 text-slate-600' : 'font-bold text-slate-900'}`}>
                        {d.account?.account_name}
                        {i === entry.details.length - 1 && entry.description && (
                          <div className="text-xs text-slate-400 italic mt-1.5 font-normal">({entry.description})</div>
                        )}
                      </TableCell>
                      <TableCell className="align-top text-slate-500 pt-3 border-0">{d.account?.account_code}</TableCell>
                      <TableCell className="text-right font-mono align-top text-slate-700 pt-3 border-0">{d.debit > 0 ? formatCurrency(d.debit, currency) : ''}</TableCell>
                      <TableCell className="text-right font-mono align-top pr-6 text-slate-700 pt-3 border-0">{d.credit > 0 ? formatCurrency(d.credit, currency) : ''}</TableCell>
                      <TableCell className="pt-3 border-0 align-top w-12 pr-4">
                        {i === 0 && (
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteData({ id: entry.id, description: entry.description || 'Journal Entry' })}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Subtle divider after each entry group */}
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableCell colSpan={6} className="p-0 h-4"></TableCell>
                  </TableRow>
                </React.Fragment>
              ))
            )}
          </TableBody>
          {!isLoading && journals && journals.length > 0 && (
            <TableFooter>
              <TableRow className="hover:bg-transparent border-t-2 border-border/60 bg-slate-100/90">
                <TableCell colSpan={3} className="pl-6 py-3 font-semibold text-slate-800">
                  Total
                </TableCell>
                <TableCell className="text-right font-mono py-3 font-semibold text-slate-900">
                  {formatCurrency(journalListTotals.debit, currency)}
                </TableCell>
                <TableCell className="text-right font-mono py-3 pr-6 font-semibold text-slate-900">
                  {formatCurrency(journalListTotals.credit, currency)}
                </TableCell>
                <TableCell className="py-3" />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      <AlertDialog open={!!deleteData} onOpenChange={(open) => !open && setDeleteData(null)}>
        <AlertDialogContent className="rounded-2xl border-border/40 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-slate-900">"{deleteData?.description}"</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-border/50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-sm"
              onClick={() => {
                if (deleteData) {
                  deleteJournal(deleteData.id);
                  setDeleteData(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
