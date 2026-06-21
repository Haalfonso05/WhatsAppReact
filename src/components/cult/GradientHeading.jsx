import { cn } from '../../lib/utils'

// funcion GradientHeading
export function GradientHeading({ children, className, as: Tag = 'h1', variant = 'default' }) {
  const gradients = {
    default: 'from-slate-900 to-slate-600 dark:from-white dark:to-slate-400',
    pink: 'from-purple-600 via-pink-500 to-orange-400',
    blue: 'from-blue-600 via-indigo-500 to-violet-500',
    green: 'from-emerald-500 via-teal-500 to-cyan-500',
  }
  return (
    <Tag
      className={cn(
        'bg-gradient-to-br bg-clip-text text-transparent font-semibold',
        gradients[variant] ?? gradients.default,
        className
      )}
    >
      {children}
    </Tag>
  )
}
