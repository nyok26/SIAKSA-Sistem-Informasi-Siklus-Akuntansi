import * as XLSX from 'xlsx';

export interface ReportItem {
  account_name: string;
  amount: number;
}

export interface IncomeStatementExcelParams {
  companyName: string;
  reportTitle: string;
  periodLabel: string;
  revenue: ReportItem[];
  expenses: ReportItem[];
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  fileBaseName: string;
}

export function downloadIncomeStatementExcel(params: IncomeStatementExcelParams): void {
  const { companyName, reportTitle, periodLabel, revenue, expenses, totalRevenue, totalExpenses, netIncome, fileBaseName } = params;

  const aoa: (string | number)[][] = [
    [companyName.trim() || '—'],
    [reportTitle],
    [periodLabel],
    [],
    ['REVENUES', 'Amount'],
  ];

  for (const r of revenue) {
    aoa.push([r.account_name, r.amount]);
  }
  aoa.push(['Total Revenues', totalRevenue]);
  aoa.push([]);

  aoa.push(['EXPENSES', 'Amount']);
  for (const e of expenses) {
    aoa.push([e.account_name, e.amount]);
  }
  aoa.push(['Total Expenses', totalExpenses]);
  aoa.push([]);

  aoa.push([netIncome >= 0 ? 'NET INCOME' : 'NET LOSS', netIncome]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 40 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Income Statement');

  const safe = fileBaseName.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'IncomeStatement';
  XLSX.writeFile(wb, `${safe}.xlsx`);
}
