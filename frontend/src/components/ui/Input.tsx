import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="font-mono text-xs text-cyber-cyan uppercase tracking-widest">
          {label}
        </label>
      )}
      <input
        className={`
          w-full bg-cyber-surface border border-cyber-muted
          text-cyber-text font-mono text-sm
          px-4 py-3 clip-cyber-sm
          outline-none
          focus:border-cyber-cyan focus:shadow-cyber-cyan
          placeholder:text-cyber-muted
          transition-all duration-200
          ${error ? 'border-cyber-pink' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-cyber-pink font-mono text-xs">{error}</span>}
    </div>
  )
}