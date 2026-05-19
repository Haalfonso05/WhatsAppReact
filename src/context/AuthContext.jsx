import { createContext, useContext, useState } from 'react'
import { authStorage } from '../lib/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authStorage.getCurrentUser())

  function register({ name, email, password }) {
    if (authStorage.emailExists(email)) return { error: 'El correo ya está registrado' }
    const newUser = { id: crypto.randomUUID(), name, email, password }
    authStorage.saveUser(newUser)
    authStorage.setCurrentUser({ id: newUser.id, name, email })
    setUser({ id: newUser.id, name, email })
    return { success: true }
  }

  function login({ email, password }) {
    const found = authStorage.findUser(email, password)
    if (!found) return { error: 'Credenciales incorrectas' }
    const session = { id: found.id, name: found.name, email: found.email }
    authStorage.setCurrentUser(session)
    setUser(session)
    return { success: true }
  }

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

export const useAuth = () => useContext(AuthContext)
