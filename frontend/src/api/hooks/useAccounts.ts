import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../axios';
import { useAuthStore } from '../../store/authStore';

export interface Account {
  id: string;
  account_code: string;
  account_name: string;
  category: 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses';
  normal_balance: 'Debit' | 'Credit';
}

export function useAccounts() {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<Account[]>({
    queryKey: ['accounts', activeCompanyId],
    queryFn: async () => {
      const res = await api.get('/accounts');
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Account, 'id'>) => {
      const res = await api.post('/accounts', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create account');
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Account> }) => {
      const res = await api.patch(`/accounts/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update account');
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/accounts/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Account deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    },
  });
}
