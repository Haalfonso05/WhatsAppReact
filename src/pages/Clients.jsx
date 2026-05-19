import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, Users, Search, CheckCircle, Circle, DollarSign } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { GradientHeading } from '../components/cult/GradientHeading'
import { TextureCard } from '../components/cult/TextureCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Modal } from '../components/ui/Modal'
import { formatCurrency, formatDate } from '../lib/utils'

const EMPTY_CLIENT = { name: '', phone: '', email: '' }
const EMPTY_DEBT = { clientId: '', amount: '', description: '' }

export default function Clients() {
  const { clients, addClient, removeClient, debts, addDebt, toggleDebtPaid, removeDebt } = useApp()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('clients')
  const [clientModal, setClientModal] = useState(false)
  const [debtModal, setDebtModal] = useState(false)
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT)
  const [debtForm, setDebtForm] = useState(EMPTY_DEBT)

  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredDebts = debts.filter((d) => {
    const client = clients.find((c) => c.id === d.clientId)
    return (client?.name || '').toLowerCase().includes(search.toLowerCase()) || d.description.toLowerCase().includes(search.toLowerCase())
  })

  function handleClientSubmit(e) {
    e.preventDefault()
    addClient(clientForm)
    setClientForm(EMPTY_CLIENT)
    setClientModal(false)
  }

  function handleDebtSubmit(e) {
    e.preventDefault()
    addDebt({ ...debtForm, amount: Number(debtForm.amount) })
    setDebtForm(EMPTY_DEBT)
    setDebtModal(false)
  }

  const totalPending = debts.filter((d) => !d.paid).reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <GradientHeading as="h1" variant="blue" className="text-3xl mb-1">Clientes y Deudas</GradientHeading>
          <p className="text-slate-500 text-sm">
            {clients.length} clientes · Deuda pendiente: <span className="font-medium text-red-500">{formatCurrency(totalPending)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setDebtModal(true)}><DollarSign size={16} />Nueva deuda</Button>
          <Button onClick={() => setClientModal(true)}><Plus size={16} />Nuevo cliente</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        {[['clients', `Clientes (${clients.length})`], ['debts', `Deudas (${debts.length})`]].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={tab === 'clients' ? 'Buscar cliente...' : 'Buscar deuda...'}
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
        />
      </div>

      {/* Clients tab */}
      <AnimatePresence mode="wait">
        {tab === 'clients' && (
          <motion.div key="clients" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {filteredClients.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Users size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-400 text-sm">No hay clientes{search ? ' que coincidan' : ' registrados'}</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredClients.map((client, i) => {
                  const clientDebts = debts.filter((d) => d.clientId === client.id)
                  const pending = clientDebts.filter((d) => !d.paid).reduce((s, d) => s + d.amount, 0)
                  return (
                    <div key={client.id}>
                      <TextureCard>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                            {client.name[0]?.toUpperCase()}
                          </div>
                          <button onClick={() => removeClient(client.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <p className="font-semibold text-slate-900 mb-0.5">{client.name}</p>
                        {client.email && <p className="text-xs text-slate-400 mb-0.5">{client.email}</p>}
                        {client.phone && <p className="text-xs text-slate-400">{client.phone}</p>}
                        {pending > 0 && (
                          <div className="mt-3 px-3 py-2 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs text-red-600 font-medium">Deuda pendiente: {formatCurrency(pending)}</p>
                          </div>
                        )}
                      </TextureCard>
                    </div>
                  )
                })}
              </div>
            )}
          </motion.div>
        )}

        {tab === 'debts' && (
          <motion.div key="debts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {filteredDebts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <DollarSign size={32} className="mx-auto mb-3 text-slate-300" />
                <p className="text-slate-400 text-sm">No hay deudas{search ? ' que coincidan' : ' registradas'}</p>
              </div>
            ) : (
              <TextureCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th className="text-left px-5 py-3 font-medium text-slate-500">Cliente</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-500">Descripción</th>
                        <th className="text-right px-4 py-3 font-medium text-slate-500">Monto</th>
                        <th className="text-left px-4 py-3 font-medium text-slate-500">Fecha</th>
                        <th className="text-center px-4 py-3 font-medium text-slate-500">Pagado</th>
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredDebts.map((debt) => {
                          const client = clients.find((c) => c.id === debt.clientId)
                          return (
                            <tr
                              key={debt.id}
                              className={`hover:bg-slate-50/50 transition-colors ${debt.paid ? 'opacity-60' : ''}`}
                            >
                              <td className="px-5 py-3.5 font-medium text-slate-800">{client?.name || '—'}</td>
                              <td className="px-4 py-3.5 text-slate-500">{debt.description || '—'}</td>
                              <td className={`px-4 py-3.5 text-right font-medium ${debt.paid ? 'line-through text-slate-400' : 'text-red-600'}`}>
                                {formatCurrency(debt.amount)}
                              </td>
                              <td className="px-4 py-3.5 text-slate-400 text-xs">{formatDate(debt.createdAt)}</td>
                              <td className="px-4 py-3.5 text-center">
                                <button onClick={() => toggleDebtPaid(debt.id)} className="transition-colors">
                                  {debt.paid
                                    ? <CheckCircle size={18} className="text-emerald-500 mx-auto" />
                                    : <Circle size={18} className="text-slate-300 mx-auto hover:text-indigo-400" />}
                                </button>
                              </td>
                              <td className="px-4 py-3.5">
                                <button onClick={() => removeDebt(debt.id)} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              </TextureCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Client Modal */}
      <Modal open={clientModal} onClose={() => setClientModal(false)} title="Nuevo cliente">
        <form onSubmit={handleClientSubmit} className="space-y-4">
          <Input label="Nombre completo" required value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} />
          <Input label="Teléfono" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} />
          <Input label="Correo electrónico" type="email" value={clientForm.email} onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })} />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setClientModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Guardar cliente</Button>
          </div>
        </form>
      </Modal>

      {/* New Debt Modal */}
      <Modal open={debtModal} onClose={() => setDebtModal(false)} title="Registrar deuda">
        <form onSubmit={handleDebtSubmit} className="space-y-4">
          <Select
            label="Cliente"
            required
            value={debtForm.clientId}
            onChange={(e) => setDebtForm({ ...debtForm, clientId: e.target.value })}
          >
            <option value="">Seleccionar cliente...</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Monto (MXN)" type="number" min="0" step="0.01" required value={debtForm.amount} onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })} />
          <Input label="Descripción" value={debtForm.description} onChange={(e) => setDebtForm({ ...debtForm, description: e.target.value })} />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setDebtModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Registrar deuda</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
