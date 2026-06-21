// Ruta protegida que exige sesion
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// funcion ProtectedRoute
export function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}