import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

interface ForgotPasswordPageProps {
  onSendCode?: (tg_username: string) => Promise<void>
  onReset?: (data: { code: string; new_password: string }) => Promise<void>
}

export default function ForgotPasswordPage({ onSendCode, onReset }: ForgotPasswordPageProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const [username, setUsername] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!username) return
    setLoading(true)
    try {
      await onSendCode?.(username)
      setStep(2)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!code || !newPassword) return
    setLoading(true)
    try {
      await onReset?.({ code, new_password: newPassword })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,245,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,245,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative w-full max-w-md">
        <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-cyber-yellow" />
        <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-cyber-yellow" />

        <div className="bg-cyber-surface/80 backdrop-blur border border-cyber-muted p-10">
          <div className="mb-8">
            <p className="font-mono text-xs text-cyber-yellow mb-1 tracking-widest">
              {step === 1 ? 'STEP 01 / 02' : 'STEP 02 / 02'}
            </p>
            <h1 className="font-display text-2xl font-black text-white uppercase tracking-wider">
              {step === 1 ? 'Reset Password' : 'New Password'}
            </h1>
          </div>

          {step === 1 ? (
            <div className="flex flex-col gap-5">
              <Input
                label="Telegram Username"
                placeholder="@username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button onClick={handleSend} loading={loading} className="w-full">
                Send Reset Code
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <Input
                label="Reset Code"
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button onClick={handleReset} loading={loading} className="w-full">
                Reset Password
              </Button>
            </div>
          )}

          <Link
            to="/login"
            className="block mt-4 font-mono text-xs text-cyber-muted hover:text-cyber-cyan transition-colors tracking-widest uppercase text-center"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}