import * as XLSX from 'xlsx';

export interface WorksheetExcelRow {
  account_code: string;
  account_name: string;
  tb_debit: number;
  tb_credit: number;
  adj_debit: number;
  adj_credit: number;
  adj_tb_debit: number;
  adj_tb_credit: number;
  is_debit: number;
  is_credit: number;
  bs_debit: number;
  bs_credit: number;
}

export interface WorksheetExcelParams {
  companyName: string;
  reportTitle: string;
  periodLabel: string;
  rows: WorksheetExcelRow[];
  totals: any;
  netIncome: number;
  fileBaseName: string;
}

/**
 * Builds a .xlsx worksheet: 10 columns for TB, Adjustments, Adjusted TB, IS, and BS.
 */
export function downloadWorksheetExcel(params: WorksheetExcelParams): void {
  const { companyName, reportTitle, periodLabel, rows, totals, netIncome, fileBaseName } = params;

  const aoa: (string | number)[][] = [
    [companyName.trim() || '—'],
    [reportTitle],
    [periodLabel],
    [],
    [
      'Account',
      'Name',
      'TB Debit', 'TB Credit',
      'Adj Debit', 'Adj Credit',
      'Adj TB Debit', 'Adj TB Credit',
      'IS Debit', 'IS Credit',
      'BS Debit', 'BS Credit'
    ],
  ];

  for (const r of rows) {
    aoa.push([
      r.account_code,
      r.account_name,
      r.tb_debit, r.tb_credit,
      r.adj_debit, r.adj_credit,
      r.adj_tb_debit, r.adj_tb_credit,
      r.is_debit, r.is_credit,
      r.bs_debit, r.bs_credit
    ]);
  }

  // Totals
  aoa.push([
    'TOTALS',
    '',
    totals.tb_debit, totals.tb_credit,
    totals.adj_debit, totals.adj_credit,
    totals.adj_tb_debit, totals.adj_tb_credit,
    totals.is_debit, totals.is_credit,
    totals.bs_debit, totals.bs_credit
  ]);

  // Net Income
  aoa.push([
    'NET INCOME (LOSS)',
    '',
    '', '', '', '', '', '',
    netIncome > 0 ? netIncome : 0,
    netIncome < 0 ? Math.abs(netIncome) : 0,
    netIncome < 0 ? Math.abs(netIncome) : 0,
    netIncome > 0 ? netIncome : 0
  ]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  
  // Column widths
  ws['!cols'] = [
    { wch: 10 }, // Account
    { wch: 30 }, // Name
    ...Array(10).fill({ wch: 15 }) // All amount columns
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Worksheet');

  const safe = fileBaseName.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'Worksheet';
  XLSX.writeFile(wb, `${safe}.xlsx`);
}
