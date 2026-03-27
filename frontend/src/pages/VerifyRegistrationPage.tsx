import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

export default function VerifyRegistrationPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const tg_username = (state as { tg_username?: string })?.tg_username

  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // If no username in state, redirect back to register
  useEffect(() => {
    if (!tg_username) {
      navigate('/register', { replace: true })
    }
  }, [tg_username, navigate])

  const handleVerify = async () => {
    if (!code) {
      setError('Введіть код підтвердження')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/verify-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tg_username, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Невірний код. Спробуйте ще раз.')
        return
      }

      // Save tokens and redirect to editor
      localStorage.setItem('access_token', data.tokens.access_token)
      localStorage.setItem('refresh_token', data.tokens.refresh_token)
      navigate('/editor')
    } catch {
      setError('Сервер недоступний. Спробуйте пізніше.')
    } finally {
      setLoading(false)
    }
  }

  if (!tg_username) return null

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,245,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,245,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative w-full max-w-md">
        <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-cyber-pink" />
        <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-cyber-pink" />
        <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-cyber-pink" />
        <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-cyber-pink" />

        <div className="bg-cyber-surface/80 backdrop-blur border border-cyber-muted p-10">
          <div className="mb-8">
            <p className="font-mono text-xs text-cyber-pink mb-1 tracking-widest">
              VERIFICATION
            </p>
            <h1 className="font-display text-2xl font-black text-white uppercase tracking-wider">
              Confirm Identity
            </h1>
          </div>

          <p className="font-mono text-sm text-cyber-text mb-6">
            Код підтвердження надіслано на ваш Telegram акаунт{' '}
            <span className="text-cyber-pink">{tg_username}</span>
          </p>

          <div className="flex flex-col gap-5">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <Input
              label="OTP Code"
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />

            <Button onClick={handleVerify} loading={loading} className="w-full mt-2" style={{ background: 'linear-gradient(90deg, #ff006e, #ff4d94)' }}>
              Verify
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
