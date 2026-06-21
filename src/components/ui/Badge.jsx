// Etiqueta de estado reutilizable
import { cn } from '../../lib/utils'

const variants = {
  'En espera': 'bg-amber-100 text-amber-700 border border-amber-200',
  Listo: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  Enviado: 'bg-blue-100 text-blue-700 border border-blue-200',
  warning: 'bg-red-100 text-red-700 border border-red-200',
  default: 'bg-slate-100 text-slate-700 border border-slate-200',
}

// funcion Badge
export function Badge({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant] ?? variants.default,
        className
      )}
    >
      {children}
    </span>
  )
}