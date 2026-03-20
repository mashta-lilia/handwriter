import { create } from 'zustand';
// Подключаем твой клиент для запросов (замени путь/название, если у вас он называется иначе, например axios)
// Небольшой локальный fallback apiClient, чтобы не зависеть от внешнего модуля,
// если ../api/client не экспортирует ничего или его нет.
const apiClient = {
  get: async (url: string) => {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data };
  }
};

// --- НОВОЕ: Описываем типы для TypeScript (Пункт 3) ---
export interface User {
  id?: string | number;
  tg_username: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>; // Обязуемся, что у нас будет функция восстановления
}
// --------------------------------------------------------

// Добавляем <AuthState>, чтобы привязать типы к хранилищу
export const useAuthStore = create<AuthState>((set, get) => ({
  
  // ТВОЙ ОРИГИНАЛЬНЫЙ СТЕЙТ (остался без изменений)
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  // ТВОИ ОРИГИНАЛЬНЫЕ МЕТОДЫ (остались без изменений)
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // --- НОВОЕ: Метод для восстановления юзера после F5 (Пункт 4) ---
  fetchProfile: async () => {
    const { token, logout } = get();
    
    if (!token) return; // Нет токена — ничего не делаем
    
    try {
      // Идем на бэкенд и узнаем, чей это токен
      // ВАЖНО: '/auth/me' — это пример, спроси у бэкендера точный URL
      const response = await apiClient.get('/auth/me'); 
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      console.error('Ошибка восстановления сессии:', error);
      logout(); // Если токен не подошел (например, истек) — выходим
    }
  }
  // -----------------------------------------------------------------
}));