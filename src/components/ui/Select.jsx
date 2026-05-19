import { cn } from '../../lib/utils'

export function Select({ className, label, error, children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <select
        className={cn(
          'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900',
          'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          'transition-colors appearance-none',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
