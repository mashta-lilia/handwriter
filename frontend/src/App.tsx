import { useEffect } from 'react' // Добавили импорт useEffect
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore' // Добавили импорт нашего хранилища

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import EditorPage from './pages/EditorPage'

export default function App() {
  // Достаем функцию восстановления профиля из стора
  const fetchProfile = useAuthStore((state) => state.fetchProfile)

  // Запускаем её один раз при старте приложения
  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  )
}