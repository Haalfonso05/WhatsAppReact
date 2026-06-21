// Contexto de autenticacion del usuario
import { createContext, useContext, useState } from 'react'
import { authStorage } from '../lib/storage'

const BASE = 'https://whatsappbackend-production-b7ef.up.railway.app'

const AuthContext = createContext(null)

// funcion AuthProvider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getCurrentUser())

  async function register({ name, email, password }) {
    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.detail || 'Error al registrar' }
      authStorage.setCurrentUser(data)
      setUser(data)
      return { success: true }
    } catch {
      return { error: 'No se pudo conectar con el servidor' }
    }
  }

  async function login({ email, password }) {
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) return { error: data.detail || 'Credenciales incorrectas' }
      authStorage.setCurrentUser(data)
      setUser(data)
      return { success: true }
    } catch {
      return { error: 'No se pudo conectar con el servidor' }
    }
  }

  // funcion logout
  function logout() {
    authStorage.clearCurrentUser()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// funcion useAuth
export const useAuth = () => useContext(AuthContext)