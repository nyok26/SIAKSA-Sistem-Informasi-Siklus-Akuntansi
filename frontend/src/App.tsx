import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AccountsPage } from '@/pages/accounts/AccountsPage';
import { JournalsPage } from '@/pages/journals/JournalsPage';
import { AdjustingPage } from '@/pages/adjusting/AdjustingPage';
import { LedgerPage } from '@/pages/reports/LedgerPage';
import { TrialBalancePage } from '@/pages/reports/TrialBalancePage';
import { WorksheetPage } from '@/pages/reports/WorksheetPage';
import { IncomeStatementPage } from '@/pages/reports/IncomeStatementPage';
import { BalanceSheetPage } from '@/pages/reports/BalanceSheetPage';
import { CompanySettingsPage } from '@/pages/settings/CompanySettingsPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/journals" element={<JournalsPage />} />
            <Route path="/adjusting" element={<AdjustingPage />} />
            
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/trial-balance" element={<TrialBalancePage />} />
            <Route path="/worksheet" element={<WorksheetPage />} />
            <Route path="/income-statement" element={<IncomeStatementPage />} />
            <Route path="/balance-sheet" element={<BalanceSheetPage />} />
            <Route path="/settings/company" element={<CompanySettingsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors theme="light" closeButton className="no-print" />
    </QueryClientProvider>
  );
}
