import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../axios';
import { useAuthStore } from '../../store/authStore';

export interface JournalDetail {
  id?: string;
  account_id: string;
  debit: number;
  credit: number;
  account?: {
    account_code: string;
    account_name: string;
  };
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  details: JournalDetail[];
}

export function useJournals(startDate?: string, endDate?: string) {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<JournalEntry[]>({
    queryKey: ['journals', activeCompanyId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const query = params.toString();
      const res = await api.get(`/journals${query ? `?${query}` : ''}`);
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}

export function useCreateJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<JournalEntry, 'id' | 'details'> & { details: Omit<JournalDetail, 'id' | 'account'>[] }) => {
      const res = await api.post('/journals', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast.success('Journal entry created successfully');
    },
    onError: (error: any) => {
      toast.error(
        Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message[0]
          : error.response?.data?.message || 'Failed to create journal entry'
      );
    },
  });
}

export function useDeleteJournal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/journals/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journals'] });
      toast.success('Journal entry deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete journal entry');
    },
  });
}
