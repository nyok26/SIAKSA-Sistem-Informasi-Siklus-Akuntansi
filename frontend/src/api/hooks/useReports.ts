import { useQuery } from '@tanstack/react-query';
import api from '../axios';
import { useAuthStore } from '../../store/authStore';

export interface LedgerTransaction {
  source_id: string;
  date: string;
  description: string;
  source: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerAccount {
  account_id: string;
  account_code: string;
  account_name: string;
  category: string;
  normal_balance: string;
  transactions: LedgerTransaction[];
  ending_balance: number;
}

export interface TrialBalanceRow {
  account_id: string;
  account_code: string;
  account_name: string;
  category: string;
  normal_balance: string;
  debit_balance: number;
  credit_balance: number;
}

export interface WorksheetRow {
  account_id: string;
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

interface ReportOptions {
  startDate?: string;
  endDate?: string;
}

function buildQueryString(base: string, params: Record<string, any>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value));
    }
  }
  const qStr = query.toString();
  return qStr ? `${base}?${qStr}` : base;
}

export function useLedger(accountId?: string, options?: ReportOptions) {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<LedgerAccount[]>({
    queryKey: ['reports', 'ledger', activeCompanyId, accountId, options?.startDate, options?.endDate],
    queryFn: async () => {
      const url = buildQueryString('/reports/ledger', { account_id: accountId, ...options });
      const res = await api.get(url);
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}

export function useTrialBalance(adjusted: boolean = false, options?: ReportOptions) {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<{ adjusted: boolean; rows: TrialBalanceRow[]; totals: { total_debit: number; total_credit: number } }>({
    queryKey: ['reports', 'trial-balance', activeCompanyId, adjusted, options?.startDate, options?.endDate],
    queryFn: async () => {
      const url = buildQueryString('/reports/trial-balance', { adjusted, ...options });
      const res = await api.get(url);
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}

export function useWorksheet(options?: ReportOptions) {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<{
    rows: WorksheetRow[];
    totals: Record<string, number>;
    net_income: number;
  }>({
    queryKey: ['reports', 'worksheet', activeCompanyId, options?.startDate, options?.endDate],
    queryFn: async () => {
      const url = buildQueryString('/reports/worksheet', { ...options });
      const res = await api.get(url);
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}

export function useIncomeStatement(options?: ReportOptions) {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<{
    revenue: any[];
    expenses: any[];
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
  }>({
    queryKey: ['reports', 'income-statement', activeCompanyId, options?.startDate, options?.endDate],
    queryFn: async () => {
      const url = buildQueryString('/reports/income-statement', { ...options });
      const res = await api.get(url);
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}

export function useBalanceSheet(options?: ReportOptions) {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<{
    assets: any[];
    liabilities: any[];
    equity: any[];
    netIncome: number;
    totalAssets: number;
    totalLiabilities: number;
    totalBaseEquity: number;
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
  }>({
    queryKey: ['reports', 'balance-sheet', activeCompanyId, options?.startDate, options?.endDate],
    queryFn: async () => {
      const url = buildQueryString('/reports/balance-sheet', { ...options });
      const res = await api.get(url);
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}

export interface StatementOfEquity {
  initialCapital: number;
  ownerContributions: number;
  netIncome: number;
  prive: number;
  capitalChange: number;
  finalCapital: number;
}

export function useStatementOfEquity(options?: ReportOptions) {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<StatementOfEquity>({
    queryKey: ['reports', 'statement-of-equity', activeCompanyId, options?.startDate, options?.endDate],
    queryFn: async () => {
      const url = buildQueryString('/reports/statement-of-equity', { ...options });
      const res = await api.get(url);
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}

export interface DashboardSummary {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
}

export function useDashboardSummary() {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<DashboardSummary>({
    queryKey: ['reports', 'summary', activeCompanyId],
    queryFn: async () => {
      const res = await api.get('/reports/summary');
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}
