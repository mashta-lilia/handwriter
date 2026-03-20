import { useState } from 'react'
import { Link, useNavigate} from 'react-router-dom'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
interface LoginFormData {
tg_username: string
password: string
}
//interface LoginPageProps {
//onSubmit?: (data: LoginFormData) => Promise<void>
//}
export default function LoginPage() {
     const navigate = useNavigate()
const [form, setForm] = useState<LoginFormData>({ tg_username: '', password: '' })
const [loading] = useState(false)
const [otpOpen, setOtpOpen] = useState(false)
const [otp, setOtp] = useState('')
const handleSubmit = async () => {
  if (form.tg_username === 'handwritter' && form.password === 'cyber2026') {
    navigate('/editor')
  } else {
    alert('❌ Wrong credentials')
  }
}
return (
<div className="min-h-screen bg-cyber-bg flex items-center justify-center px-4">
{/* Grid bg */}
<div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,245,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,245,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
<div className="relative w-full max-w-md">
{/* Corner decorations */}
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
<Input
label="TelegramUsername"
placeholder="@username"
value={form.tg_username}
onChange={(e) => setForm({ ...form, tg_username: e.target.value })}
/>
<PasswordInput
label="Password"
placeholder="••••••••"
value={form.password}
onChange={(e) => setForm({ ...form, password: e.target.value })}
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
{/* OTP Modal */}
<Modal open={otpOpen} onClose={() => setOtpOpen(false)} title="Verify Identity">
<div className="flex flex-col gap-5">
<p className="font-mono text-xs text-cyber-text">
            Enter the code sent to your Telegram account.
</p>
<Input
label="OTP Code"
placeholder="000000"
value={otp}
onChange={(e) => setOtp(e.target.value)}
/>
<Button className="w-full">Verify</Button>
</div>
</Modal>
</div>
  )
}