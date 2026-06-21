// Funciones utilitarias
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// funcion cn
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// funcion formatCurrency
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount)
}

// funcion formatDate
export function formatDate(date) {
  if (!date) return '—'
  try {
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(new Date(date))
  } catch {
    return date
  }
}

// funcion today
export function today() {
  return new Date().toISOString().split('T')[0]
}

// funcion currentMonth
export function currentMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}