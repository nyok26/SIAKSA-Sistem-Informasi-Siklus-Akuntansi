import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  activeCompanyId: string | null;
  setAuth: (user: User, token: string) => void;
  setActiveCompanyId: (id: string | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      activeCompanyId: null,
      setAuth: (user, token) => set({ user, token }),
      setActiveCompanyId: (id) => set({ activeCompanyId: id }),
      clearAuth: () => set({ user: null, token: null, activeCompanyId: null }),
    }),
    { name: 'siaksa-auth' },
  ),
);
