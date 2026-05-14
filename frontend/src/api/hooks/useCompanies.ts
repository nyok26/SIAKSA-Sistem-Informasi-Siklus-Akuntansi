import useSWR from 'swr';
import api from '../axios';

export interface Company {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
}

export const fetcher = (url: string) => api.get(url).then((res) => res.data);

export function useCompanies() {
  const { data, error, isLoading, mutate } = useSWR<Company[]>('/companies', fetcher);

  const createCompany = async (name: string, currency: string) => {
    const res = await api.post('/companies', { name, currency });
    mutate();
    return res.data;
  };

  const updateCompany = async (id: string, name: string, currency: string) => {
    const res = await api.patch(`/companies/${id}`, { name, currency });
    mutate();
    return res.data;
  };

  const deleteCompany = async (id: string) => {
    await api.delete(`/companies/${id}`);
    mutate();
  };

  return {
    companies: data || [],
    isLoading,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
  };
}

import { useAuthStore } from '../../store/authStore';

export function useActiveCompany() {
  const { activeCompanyId } = useAuthStore();
  const { companies, isLoading } = useCompanies();
  const activeCompany = companies.find(c => c.id === activeCompanyId);
  return { activeCompany, isLoading };
}
