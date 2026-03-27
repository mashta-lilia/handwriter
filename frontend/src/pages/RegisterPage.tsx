import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import Button from '../components/ui/Button'

interface RegisterFormData {
  tg_username: string
  password: string
  confirm_password: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterFormData>({
    tg_username: '',
    password: '',
    confirm_password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    const tgRegex = /^[a-zA-Z0-9_]{5,}$/;
    if (!form.tg_username) {
      newErrors.tg_username = 'Обов\'язкове поле';
      isValid = false;
    } else if (!tgRegex.test(form.tg_username.replace('@', ''))) {
      newErrors.tg_username = 'Мінімум 5 символів, лише латиниця, цифри та "_"';
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = 'Обов\'язкове поле';
      isValid = false;
    } else if (form.password.length < 8) {
      newErrors.password = 'Пароль має бути не менше 8 символів';
      isValid = false;
    }

    if (form.password !== form.confirm_password) {
      newErrors.confirm_password = 'Паролі не співпадають';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const tg = form.tg_username.replace('@', '')

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: tg,
          tg_username: tg,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data?.error_code === 'USER_ALREADY_EXISTS') {
          setErrors({ tg_username: 'Цей Telegram акаунт вже зареєстрований.' });
        } else if (data?.error_code === 'TELEGRAM_BOT_NOT_STARTED') {
          setErrors({ server: `Спочатку запустіть нашого Telegram бота: @${data.bot_username}` });
        } else {
          setErrors({ server: data?.message || 'Помилка при реєстрації' });
        }
        return;
      }

      // Registration successful — redirect to OTP verification
      navigate('/verify-registration', {
        state: { tg_username: tg },
      });
    } catch {
      setErrors({ server: 'Сервер недоступний. Спробуйте пізніше.' });
    } finally {
      setLoading(false);
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
            {/* 5. ИСПРАВЛЕНИЕ: Блок для вывода ошибки от сервера */}
            {errors.server && (
              <div className="p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm text-center">
                {errors.server}
              </div>
            )}

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