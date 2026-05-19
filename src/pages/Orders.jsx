import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ShoppingCart, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { GradientHeading } from '../components/cult/GradientHeading'
import { TextureCard } from '../components/cult/TextureCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { formatCurrency, formatDate } from '../lib/utils'

const STATUSES = ['En espera', 'Listo', 'Enviado']
const EMPTY_FORM = { clientName: '', product: '', quantity: '', total: '', notes: '' }

export default function Orders() {
  const { orders, addOrder, updateOrderStatus, removeOrder } = useApp()
  const [filter, setFilter] = useState('Todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const filtered = filter === 'Todos' ? orders : orders.filter((o) => o.status === filter)

  function handleSubmit(e) {
    e.preventDefault()
    addOrder({ ...form, quantity: Number(form.quantity), total: Number(form.total) })
    setForm(EMPTY_FORM)
    setModalOpen(false)
  }

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: orders.filter((o) => o.status === s).length }), {})

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <GradientHeading as="h1" variant="blue" className="text-3xl mb-1">Pedidos</GradientHeading>
          <p className="text-slate-500 text-sm">{orders.length} pedidos en total</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus size={16} />Nuevo pedido</Button>
      </div>

      {/* Status counts */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['Todos', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === s
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}
          >
            {s} {s !== 'Todos' && <span className="ml-1 opacity-70">{counts[s]}</span>}
          </button>
        ))}
      </div>

      {/* Orders grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <ShoppingCart size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 text-sm">No hay pedidos{filter !== 'Todos' ? ` con estado "${filter}"` : ''}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((order) => (
              <div key={order.id}>
                <TextureCard className="flex flex-col gap-3 h-full">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{order.clientName}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.createdAt)}</p>
                    </div>
                    <Badge variant={order.status}>{order.status}</Badge>
                  </div>

                  <div className="text-sm text-slate-600 space-y-1">
                    <p><span className="text-slate-400">Producto:</span> {order.product}</p>
                    <p><span className="text-slate-400">Cantidad:</span> {order.quantity}</p>
                    <p><span className="text-slate-400">Total:</span> <span className="font-medium text-slate-800">{formatCurrency(order.total)}</span></p>
                    {order.notes && <p className="text-slate-400 text-xs italic">"{order.notes}"</p>}
                  </div>

                  <div className="flex items-center gap-2 pt-1 mt-auto border-t border-slate-100">
                    <div className="relative flex-1">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 pr-7 cursor-pointer"
                      >
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <button
                      onClick={() => removeOrder(order.id)}
                      className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </TextureCard>
              </div>
            ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo pedido">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Cliente" required value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
          <Input label="Producto" required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cantidad" type="number" min="1" required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Input label="Total (MXN)" type="number" min="0" step="0.01" required value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
          </div>
          <Input label="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">Crear pedido</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
