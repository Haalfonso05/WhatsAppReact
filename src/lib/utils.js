import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(date))
}

export function today() {
  return new Date().toISOString().split('T')[0]
}

export function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
