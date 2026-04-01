import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyRegistrationPage from './pages/VerifyRegistrationPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import EditorPage from './pages/EditorPage'

export default function App() {
  const fetchProfile = useAuthStore((state) => state.fetchProfile)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) fetchProfile()
  }, [fetchProfile])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-registration" element={<VerifyRegistrationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/editor" element={<EditorPage />} />
    </Routes>
  )
}