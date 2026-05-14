import * as XLSX from 'xlsx';

export interface TrialBalanceExcelRow {
  account_code: string;
  account_name: string;
  debit_balance: number;
  credit_balance: number;
}

export interface TrialBalanceExcelParams {
  companyName: string;
  reportTitle: string;
  periodLabel: string;
  rows: TrialBalanceExcelRow[];
  totalDebit: number;
  totalCredit: number;
  /** Filename without extension (ASCII-safe) */
  fileBaseName: string;
}

/**
 * Builds a .xlsx trial balance: 3-line header, column headers, numeric debit/credit, total row.
 */
export function downloadTrialBalanceExcel(params: TrialBalanceExcelParams): void {
  const { companyName, reportTitle, periodLabel, rows, totalDebit, totalCredit, fileBaseName } = params;

  const aoa: (string | number)[][] = [
    [companyName.trim() || '—'],
    [reportTitle],
    [periodLabel],
    [],
    ['Account No.', 'Account Name', 'Debit', 'Credit'],
  ];

  for (const r of rows) {
    const d = Number(r.debit_balance) || 0;
    const c = Number(r.credit_balance) || 0;
    aoa.push([r.account_code, r.account_name, d > 0 ? d : 0, c > 0 ? c : 0]);
  }

  aoa.push(['Total', '', totalDebit, totalCredit]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 14 }, { wch: 42 }, { wch: 16 }, { wch: 16 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance');

  const safe = fileBaseName.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'TrialBalance';
  XLSX.writeFile(wb, `${safe}.xlsx`);
}
