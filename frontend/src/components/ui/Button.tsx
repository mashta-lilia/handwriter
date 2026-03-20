import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'relative font-display font-bold uppercase tracking-widest text-sm transition-all duration-200 clip-cyber-sm px-6 py-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary:
      'bg-cyber-cyan text-cyber-bg hover:shadow-cyber-cyan hover:scale-[1.02] active:scale-[0.98]',
    secondary:
      'bg-transparent border border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan hover:text-cyber-bg hover:shadow-cyber-cyan',
    ghost:
      'bg-transparent text-cyber-text hover:text-cyber-cyan hover:border-cyber-cyan border border-cyber-muted',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  )
}