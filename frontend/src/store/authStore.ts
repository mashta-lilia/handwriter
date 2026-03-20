import { create } from 'zustand';
import { apiClient } from '../api/client'; // Подключаем твой настроенный axios

// 1. Описываем, как выглядит пользователь (TypeScript)
export interface User {
  id?: string | number;
  tg_username: string;
  // если бэкенд возвращает еще какие-то поля, добавишь их сюда
}

// 2. Описываем, что вообще лежит в нашем хранилище
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchProfile: () => Promise<void>; // Та самая новая функция для шага 4
}

// 3. Создаем само хранилище
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null, // Изначально юзера нет
  token: localStorage.getItem('token') || null, // Но токен пытаемся достать из памяти
  isAuthenticated: !!localStorage.getItem('token'),
  
  // Функция логина/регистрации (сохраняем токен)
  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    set({ user, token, isAuthenticated: true });
  },
  
  // Функция выхода (удаляем токен)
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // === РЕШЕНИЕ ШАГА 4 ===
  // Эта функция сходит на бэкенд с токеном и получит данные юзера
  fetchProfile: async () => {
    const { token, logout } = get();
    
    if (!token) return; // Если токена нет, даже не пытаемся
    
    try {
      // ПРИМЕЧАНИЕ: замени '/auth/me' на тот URL, который реально отдает профиль на вашем бэкенде
      const response = await apiClient.get('/auth/me'); 
      // Сохраняем полученного юзера
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      console.error('Ошибка восстановления сессии:', error);
      logout(); // Если бэкенд ответил ошибкой (токен протух), разлогиниваем
    }
  }
}));