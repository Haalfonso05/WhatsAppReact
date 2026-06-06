import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date) {
  if (!date) return '—'
  try {
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(date))
  } catch {
    return date
  }
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
