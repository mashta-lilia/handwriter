interface ProgressBarProps {
  value: number // 0–100
  label?: string
}

export default function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-1">
          <span className="font-mono text-xs text-cyber-cyan uppercase tracking-widest">{label}</span>
          <span className="font-mono text-xs text-cyber-text">{Math.round(value)}%</span>
        </div>
      )}
      <div className="w-full h-1.5 bg-cyber-muted relative overflow-hidden">
        <div
          className="h-full bg-cyber-cyan shadow-cyber-cyan transition-all duration-300 relative"
          style={{ width: `${value}%` }}
        >
          <div className="absolute right-0 top-0 h-full w-4 bg-white/40 blur-sm" />
        </div>
      </div>
    </div>
  )
}