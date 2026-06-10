import * as XLSX from 'xlsx';

export interface JournalExcelRow {
  date: string;
  account_code: string;
  account_name: string;
  description: string;
  debit: number;
  credit: number;
}

export interface JournalExcelParams {
  companyName: string;
  reportTitle: string;
  periodLabel: string;
  rows: JournalExcelRow[];
  totalDebit: number;
  totalCredit: number;
  fileBaseName: string;
}

/**
 * Builds a .xlsx journal: header, column headers, transaction rows, total row.
 */
export function downloadJournalExcel(params: JournalExcelParams): void {
  const { companyName, reportTitle, periodLabel, rows, totalDebit, totalCredit, fileBaseName } = params;

  const aoa: (string | number)[][] = [
    [companyName.trim() || '—'],
    [reportTitle],
    [periodLabel],
    [],
    ['Date', 'Account No.', 'Account Name', 'Description', 'Debit', 'Credit'],
  ];

  for (const r of rows) {
    aoa.push([
      r.date,
      r.account_code,
      r.account_name,
      r.description,
      Number(r.debit) || 0,
      Number(r.credit) || 0,
    ]);
  }

  aoa.push(['Total', '', '', '', totalDebit, totalCredit]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  
  // Column widths
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 14 }, // Account No
    { wch: 35 }, // Account Name
    { wch: 40 }, // Description
    { wch: 16 }, // Debit
    { wch: 16 }, // Credit
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Journal');

  const safe = fileBaseName.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'Journal';
  XLSX.writeFile(wb, `${safe}.xlsx`);
}
