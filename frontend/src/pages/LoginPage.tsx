import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import Button from '../components/ui/Button'

interface LoginFormData {
  tg_username: string
  password: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<LoginFormData>({ tg_username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.tg_username || !form.password) return
    setLoading(true)
    setError('')
    try {
      const tg = form.tg_username.replace('@', '')
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tg_username: tg, password: form.password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.message || data?.detail || 'Невірні облікові дані')
        return
      }
      // Backend returns tokens at top level, not nested
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      navigate('/editor')
    } catch {
      setError('Сервер недоступний. Спробуйте пізніше.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,245,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,245,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="relative w-full max-w-md">
        <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-cyber-cyan" />
        <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-cyber-cyan" />
        <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-cyber-cyan" />
        <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-cyber-cyan" />
        <div className="bg-cyber-surface/80 backdrop-blur border border-cyber-muted p-10">
          <div className="mb-8">
            <p className="font-mono text-xs text-cyber-cyan mb-1 tracking-widest">SYSTEM ACCESS</p>
            <h1 className="font-display text-3xl font-black text-white uppercase tracking-wider animate-glitch">
              HANDWRITTER
            </h1>
          </div>
          <div className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm text-center">
                {error}
              </div>
            )}
            <Input
              label="Telegram Username"
              placeholder="@username"
              value={form.tg_username}
              onChange={(e) => { setError(''); setForm({ ...form, tg_username: e.target.value }) }}
            />
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => { setError(''); setForm({ ...form, password: e.target.value }) }}
            />
            <Link
              to="/forgot-password"
              className="font-mono text-xs text-cyber-muted hover:text-cyber-cyan transition-colors self-end tracking-widest uppercase"
            >
              Forgot Password?
            </Link>
            <Button onClick={handleSubmit} loading={loading} className="w-full mt-2">
              Sign In
            </Button>
            <Link to="/register">
              <Button variant="secondary" className="w-full">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}