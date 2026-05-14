import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import api from '../axios';
import { JournalEntry, JournalDetail } from './useJournals';
import { useAuthStore } from '../../store/authStore';

export function useAdjustingEntries(startDate?: string, endDate?: string) {
  const activeCompanyId = useAuthStore((s) => s.activeCompanyId);
  return useQuery<JournalEntry[]>({
    queryKey: ['adjusting', activeCompanyId, startDate, endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      const query = params.toString();
      const res = await api.get(`/adjusting${query ? `?${query}` : ''}`);
      return res.data;
    },
    enabled: !!activeCompanyId,
  });
}

export function useCreateAdjustingEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<JournalEntry, 'id' | 'details'> & { details: Omit<JournalDetail, 'id' | 'account'>[] }) => {
      const res = await api.post('/adjusting', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjusting'] });
      toast.success('Adjusting entry created successfully');
    },
    onError: (error: any) => {
      toast.error(
        Array.isArray(error.response?.data?.message)
          ? error.response?.data?.message[0]
          : error.response?.data?.message || 'Failed to create adjusting entry'
      );
    },
  });
}

export function useDeleteAdjustingEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/adjusting/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adjusting'] });
      toast.success('Adjusting entry deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete adjusting entry');
    },
  });
}
