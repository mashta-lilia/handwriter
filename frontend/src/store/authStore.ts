import { create } from 'zustand';

const apiClient = {
  get: async (url: string) => {
    const token = localStorage.getItem('access_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) {
      const error = new Error(`HTTP ${res.status}`) as Error & { status: number };
      error.status = res.status;
      throw error;
    }
    const data = await res.json();
    return { data };
  }
};

export interface User {
  id?: string | number;
  tg_username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,
  isAuthenticated: !!localStorage.getItem('access_token'),

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('access_token', token);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    const { token, logout } = get();

    if (!token) return;

    try {
      const response = await apiClient.get('/api/auth/me');
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      const err = error as Error & { status?: number };
      if (err?.status === 401) {
        logout(); // Token expired or invalid — clear session
      }
      // Any other error (404, network) — do nothing, keep existing session
    }
  }
}));
