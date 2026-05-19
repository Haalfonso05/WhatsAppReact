import { cn } from '../../lib/utils'

export function TextureCard({ children, className }) {
  return (
    <div
      className={cn(
        'relative rounded-2xl border border-slate-200 bg-white p-6',
        'shadow-sm transition-shadow hover:shadow-md',
        'before:absolute before:inset-0 before:rounded-2xl',
        'before:bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,0.06),_transparent_60%)]',
        'overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  )
}
