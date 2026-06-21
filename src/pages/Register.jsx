// Pantalla de registro
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// funcion LightField
function LightField({ label, type = 'text', placeholder, value, onChange, icon: Icon, suffix }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative flex items-center">
        {Icon && (
          <Icon size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
        )}
        <input
          type={type}
          required
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800
            placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-2
            focus:ring-emerald-100 transition-colors ${Icon ? 'pl-10' : ''} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && (
          <div className="absolute right-3 flex items-center">{suffix}</div>
        )}
      </div>
    </div>
  )
}

// funcion Register
export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [obscure, setObscure] = useState(true)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (form.password.length < 4) { setError('Mínimo 4 caracteres'); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 250))
    const result = register({ name: form.name, email: form.email, password: form.password })
    setLoading(false)
    if (result.error) { setError(result.error); return }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: '#F4F4F5' }}>
      <div className="w-full max-w-sm">
        <div
          className="bg-white rounded-3xl overflow-hidden"
          style={{ border: '1px solid #E2E8F0', boxShadow: '0 12px 32px rgba(15,23,42,0.06)' }}
        >
          {/* Header */}
          <div className="px-7 pt-9 pb-7 flex flex-col items-center" style={{ backgroundColor: '#ECFDF5' }}>
            <div
              className="w-16 h-16 flex items-center justify-center mb-4"
              style={{ backgroundColor: '#10B981', borderRadius: '22px' }}
            >
              <UserPlus size={30} color="white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight" style={{ color: '#064E3B' }}>
              Crea tu cuenta
            </h1>
            <p className="text-sm mt-1" style={{ color: '#059669' }}>
              Es rápido y fácil, empecemos
            </p>
          </div>

          {/* Form */}
          <div className="px-7 pt-7 pb-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <div
                  className="px-4 py-3 rounded-xl text-sm"
                  style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626' }}
                >
                  {error}
                </div>
              )}

              <LightField
                label="Nombre completo"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                icon={User}
              />

              <LightField
                label="Correo electrónico"
                type="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                icon={Mail}
              />

              <LightField
                label="Contraseña"
                type={obscure ? 'password' : 'text'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                icon={Lock}
                suffix={
                  <button
                    type="button"
                    onClick={() => setObscure(!obscure)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {obscure ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-70 mt-1"
                style={{ backgroundColor: '#10B981' }}
              >
                {loading ? 'Creando cuenta...' : 'Registrarse'}
              </button>
            </form>

            <p className="text-center text-sm mt-6 text-slate-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium" style={{ color: '#10B981' }}>
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}