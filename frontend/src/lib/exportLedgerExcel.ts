import * as XLSX from 'xlsx';

export interface LedgerExcelTransaction {
  date: string;
  description: string;
  source: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerExcelAccount {
  account_code: string;
  account_name: string;
  normal_balance: string;
  transactions: LedgerExcelTransaction[];
}

export interface LedgerExcelParams {
  companyName: string;
  reportTitle: string;
  periodLabel: string;
  accounts: LedgerExcelAccount[];
  fileBaseName: string;
}

/**
 * Builds a .xlsx ledger: Multiple account tables in one sheet.
 */
export function downloadLedgerExcel(params: LedgerExcelParams): void {
  const { companyName, reportTitle, periodLabel, accounts, fileBaseName } = params;

  const aoa: (string | number)[][] = [
    [companyName.trim() || '—'],
    [reportTitle],
    [periodLabel],
    [],
  ];

  for (const acc of accounts) {
    aoa.push([`${acc.account_code} - ${acc.account_name}`, '', '', '', '', `Normal: ${acc.normal_balance}`]);
    aoa.push(['Date', 'Description', 'Source', 'Debit', 'Credit', 'Balance']);
    
    let totalDebit = 0;
    let totalCredit = 0;

    for (const t of acc.transactions) {
      aoa.push([
        t.date,
        t.description,
        t.source,
        Number(t.debit) || 0,
        Number(t.credit) || 0,
        Number(t.balance) || 0,
      ]);
      totalDebit += Number(t.debit) || 0;
      totalCredit += Number(t.credit) || 0;
    }

    aoa.push(['Total', '', '', totalDebit, totalCredit, '']);
    aoa.push([]); // Empty row between accounts
  }

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  
  // Column widths
  ws['!cols'] = [
    { wch: 12 }, // Date
    { wch: 40 }, // Description
    { wch: 15 }, // Source
    { wch: 16 }, // Debit
    { wch: 16 }, // Credit
    { wch: 16 }, // Balance
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'General Ledger');

  const safe = fileBaseName.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'Ledger';
  XLSX.writeFile(wb, `${safe}.xlsx`);
}
