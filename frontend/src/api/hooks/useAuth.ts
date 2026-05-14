import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../axios';
import { useAuthStore } from '../../store/authStore';

interface LoginPayload { email: string; password: string }
interface RegisterPayload { email: string; username: string; password: string }

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: LoginPayload) => {
      const res = await api.post('/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Invalid email or password');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterPayload) => {
      const res = await api.post('/auth/register', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Account created! Please log in.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
}
