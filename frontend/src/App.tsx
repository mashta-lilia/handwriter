import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import EditorPage from './pages/EditorPage'

export default function App() {
  const fetchProfile = useAuthStore((state) => state.fetchProfile)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // --- ДОБАВИЛИ ФУНКЦИЮ ОБРАБОТКИ ---
  const handleRegister = async (data: { tg_username: string; password: string }) => {
    console.log('Данные для регистрации:', data);
    // Позже здесь будет вызов реального API для регистрации
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      {/* --- ДОБАВИЛИ ONSUBMIT --- */}
      <Route path="/register" element={<RegisterPage onSubmit={handleRegister} />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  )
}