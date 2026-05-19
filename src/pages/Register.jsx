import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { GradientHeading } from '../components/cult/GradientHeading'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function field(key) {
    return {
      value: form[key],
      onChange: (e) => setForm({ ...form, [key]: e.target.value }),
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Las contraseñas no coinciden'); return }
    if (form.password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 300))
    const result = register({ name: form.name, email: form.email, password: form.password })
    setLoading(false)
    if (result.error) { setError(result.error); return }
    navigate('/dashboard')
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-colors'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6 mx-auto">
            <UserPlus size={22} className="text-indigo-400" />
          </div>

          <GradientHeading as="h1" className="text-2xl text-center mb-1 from-white to-slate-300">
            Crear cuenta
          </GradientHeading>
          <p className="text-slate-400 text-sm text-center mb-8">Completa el formulario para registrarte</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name', label: 'Nombre completo', type: 'text', placeholder: 'Juan García' },
              { key: 'email', label: 'Correo electrónico', type: 'email', placeholder: 'tu@correo.com' },
              { key: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••' },
              { key: 'confirm', label: 'Confirmar contraseña', type: 'password', placeholder: '••••••••' },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300">{label}</label>
                <input type={type} required placeholder={placeholder} className={inputClass} {...field(key)} />
              </div>
            ))}

            {error && (
              <motion.p
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </Button>
          </form>

          <p className="text-slate-500 text-sm text-center mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
