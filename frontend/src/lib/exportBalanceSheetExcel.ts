import * as XLSX from 'xlsx';

export interface ReportItem {
  account_name: string;
  amount: number;
}

export interface BalanceSheetExcelParams {
  companyName: string;
  reportTitle: string;
  periodLabel: string;
  assets: ReportItem[];
  liabilities: ReportItem[];
  equity: ReportItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  netIncome: number;
  totalLiabilitiesAndEquity: number;
  fileBaseName: string;
}

export function downloadBalanceSheetExcel(params: BalanceSheetExcelParams): void {
  const { 
    companyName, reportTitle, periodLabel, 
    assets, liabilities, equity, 
    totalAssets, totalLiabilities, totalEquity, 
    netIncome, totalLiabilitiesAndEquity, 
    fileBaseName 
  } = params;

  const aoa: (string | number)[][] = [
    [companyName.trim() || '—'],
    [reportTitle],
    [periodLabel],
    [],
    ['ASSETS', 'Amount'],
  ];

  for (const a of assets) {
    aoa.push([a.account_name, a.amount]);
  }
  aoa.push(['Total Assets', totalAssets]);
  aoa.push([]);

  aoa.push(['LIABILITIES', 'Amount']);
  for (const l of liabilities) {
    aoa.push([l.account_name, l.amount]);
  }
  aoa.push(['Total Liabilities', totalLiabilities]);
  aoa.push([]);

  aoa.push(['EQUITY', 'Amount']);
  for (const e of equity) {
    aoa.push([e.amount < 0 ? `Less: ${e.account_name}` : e.account_name, e.amount]);
  }
  aoa.push(['Add: Net Income', netIncome]);
  aoa.push(['Total Equity', totalEquity]);
  aoa.push([]);

  aoa.push(['Total Liabilities & Equity', totalLiabilitiesAndEquity]);

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 40 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet');

  const safe = fileBaseName.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'BalanceSheet';
  XLSX.writeFile(wb, `${safe}.xlsx`);
}
