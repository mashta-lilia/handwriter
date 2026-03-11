import { InputHTMLAttributes, useState } from 'react'

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function PasswordInput({ label, error, className = '', ...props }: PasswordInputProps) {
  const [show, setShow] = useState(false)

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label className="font-mono text-xs text-cyber-cyan uppercase tracking-widest">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          className={`
            w-full bg-cyber-surface border border-cyber-muted
            text-cyber-text font-mono text-sm
            px-4 py-3 pr-12 clip-cyber-sm
            outline-none
            focus:border-cyber-cyan focus:shadow-cyber-cyan
            placeholder:text-cyber-muted
            transition-all duration-200
            ${error ? 'border-cyber-pink' : ''}
            ${className}
          `}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-cyan transition-colors"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          )}
        </button>
      </div>
      {error && <span className="text-cyber-pink font-mono text-xs">{error}</span>}
    </div>
  )
}