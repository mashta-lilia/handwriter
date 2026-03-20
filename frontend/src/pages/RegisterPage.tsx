import { useState } from 'react'
import { Link } from 'react-router-dom'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import Button from '../components/ui/Button'

interface RegisterFormData {
  tg_username: string
  password: string
  confirm_password: string
}

interface RegisterPageProps {
  onSubmit?: (data: Omit<RegisterFormData, 'confirm_password'>) => Promise<void>
}

export default function RegisterPage({ onSubmit }: RegisterPageProps) {
  const [form, setForm] = useState<RegisterFormData>({
    tg_username: '',
    password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({})

  const validate = () => {
    const e: Partial<RegisterFormData> = {}
    if (!form.tg_username) e.tg_username = 'Required'
    if (!form.password) e.password = 'Required'
    if (form.password !== form.confirm_password) e.confirm_password = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirm_password: _, ...data } = form
      await onSubmit?.(data)
    } finally {
      setLoading(false)
    }
  }

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
            <p className="font-mono text-xs text-cyber-pink mb-1 tracking-widest">NEW IDENTITY</p>
            <h1 className="font-display text-3xl font-black text-white uppercase tracking-wider">
              REGISTER
            </h1>
          </div>

          <div className="flex flex-col gap-5">
            <Input
              label="Telegram Username"
              placeholder="@username"
              value={form.tg_username}
              error={errors.tg_username}
              onChange={(e) => setForm({ ...form, tg_username: e.target.value })}
            />
            <PasswordInput
              label="Password"
              placeholder="••••••••"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="••••••••"
              value={form.confirm_password}
              error={errors.confirm_password}
              onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
            />

            <Button onClick={handleSubmit} loading={loading} className="w-full mt-2" style={{ background: 'linear-gradient(90deg, #ff006e, #ff4d94)' }}>
              Sign Up
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="w-full">
                Already have an account? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}