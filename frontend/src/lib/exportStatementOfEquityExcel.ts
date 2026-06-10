import * as XLSX from 'xlsx';

export interface StatementOfEquityExcelParams {
  companyName: string;
  reportTitle: string;
  periodLabel: string;
  initialCapital: number;
  ownerContributions: number;
  netIncome: number;
  prive: number;
  capitalChange: number;
  finalCapital: number;
  fileBaseName: string;
}

export function downloadStatementOfEquityExcel(params: StatementOfEquityExcelParams): void {
  const { 
    companyName, reportTitle, periodLabel, 
    initialCapital, ownerContributions, netIncome, prive, capitalChange, finalCapital,
    fileBaseName 
  } = params;

  const aoa: (string | number)[][] = [
    [companyName.trim() || '—'],
    [reportTitle],
    [periodLabel],
    [],
    ["Owner's Equity", 'Amount'],
    ['Capital, Beginning Balance', initialCapital],
    ['Add: Owner Contributions', ownerContributions],
    ['Add: Net Income', netIncome],
    ["Less: Owner's Drawings", -prive],
    [capitalChange >= 0 ? 'Net Increase in Equity' : 'Net Decrease in Equity', capitalChange],
    ['Capital, Ending Balance', finalCapital],
  ];

  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws['!cols'] = [{ wch: 40 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Statement of Equity');

  const safe = fileBaseName.replace(/[^\w.\-]+/g, '_').slice(0, 120) || 'StatementOfEquity';
  XLSX.writeFile(wb, `${safe}.xlsx`);
}
