import { cn } from '../../lib/utils'

export function Input({ className, label, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900',
          'placeholder:text-slate-400 transition-colors',
          'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
