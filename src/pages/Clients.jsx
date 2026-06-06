import { useState, useCallback } from 'react'
import { Plus, Users, Search, CheckCircle, Circle, DollarSign, Loader2, Pencil, Trash2 } from 'lucide-react'
import { GradientHeading } from '../components/cult/GradientHeading'
import { TextureCard } from '../components/cult/TextureCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { SearchPicker } from '../components/ui/SearchPicker'
import { formatCurrency, formatDate } from '../lib/utils'
import { api } from '../lib/api'
import { useClients, useDebts } from '../lib/hooks'

const EMPTY_CLIENT = { name_1: '', name_2: '', last_name_1: '', last_name_2: '', document: '', phone_number: '', address: '' }

export default function Clients() {
  const [tab, setTab] = useState('clients')
  const [search, setSearch] = useState('')
  const [clientModal, setClientModal] = useState(false)
  const [editModal, setEditModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [debtModal, setDebtModal] = useState(false)
  const [clientForm, setClientForm] = useState(EMPTY_CLIENT)
  const [editForm, setEditForm] = useState(EMPTY_CLIENT)
  const [saving, setSaving] = useState(false)

  const [debtClient, setDebtClient] = useState(null)
  const [debtOrder, setDebtOrder] = useState(null)
  const [clientOrders, setClientOrders] = useState([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [debtAmount, setDebtAmount] = useState('')
  const [debtDesc, setDebtDesc] = useState('')

  const clients = useClients({ search })
  const debts = useDebts()

  const totalPending = debts.items
    .filter(d => d.status === 'A' || !d.paid)
    .reduce((s, d) => s + Number(d.value || d.amount || 0), 0)

  function clientNameFromDoc(doc) {
    const c = clients.items.find(x => x.document === doc)
    return c ? `${c.name_1} ${c.last_name_1}` : doc
  }

  async function loadOrders(client) {
    setLoadingOrders(true); setDebtOrder(null); setClientOrders([])
    try {
      const res = await api.getOrders({ search: `${client.name_1} ${client.last_name_1}`, size: 50 })
      setClientOrders(res.items)
    } catch (e) { console.error(e) }
    finally { setLoadingOrders(false) }
  }

  async function handleClientSubmit(e) {
    e.preventDefault(); setSaving(true)
    try {
      await api.createClient(clientForm)
      setClientModal(false); setClientForm(EMPTY_CLIENT); clients.reload()
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  function openEdit(client) {
    setEditingClient(client)
    setEditForm({
      name_1: client.name_1 || '',
      name_2: client.name_2 || '',
      last_name_1: client.last_name_1 || '',
      last_name_2: client.last_name_2 || '',
      document: client.document,
      phone_number: client.phone_number || '',
      address: client.address || '',
    })
    setEditModal(true)
  }

  async function handleEditSubmit(e) {
    e.preventDefault()
    if (!editForm.name_1 || !editForm.last_name_1) return alert('Nombre y apellido son obligatorios')
    setSaving(true)
    try {
      await api.updateClient(editingClient.document, editForm)
      setEditModal(false); setEditingClient(null); clients.reload()
    } catch (err) {
      alert('Error al guardar: ' + (err.message || 'Error desconocido'))
    } finally { setSaving(false) }
  }

  async function handleDebtSubmit(e) {
    e.preventDefault(); setSaving(true)
    try {
      await api.createDebt({
        customer_document: debtClient.document,
        order_id: parseInt(debtOrder.id_order),
        value: parseFloat(debtAmount),
        status: 'A',
        creation_date: new Date().toISOString().split('T')[0],
      })
      setDebtModal(false); setDebtClient(null); setDebtOrder(null); setDebtAmount(''); setDebtDesc('')
      debts.reload()
    } catch (err) { alert(err.message) }
    finally { setSaving(false) }
  }

  async function togglePaid(debt) {
    const newStatus = (debt.status === 'A') ? 'P' : 'A'
    try { await api.toggleDebtPaid(debt.id, newStatus === 'P'); debts.reload() }
    catch (e) { console.error(e) }
  }

  async function deleteDebt(debtId) {
    if (!confirm('¿Eliminar esta deuda?')) return
    try {
      await fetch(`http://127.0.0.1:8000/credits/${debtId}`, { method: 'DELETE' })
      debts.reload()
    } catch (e) { console.error(e) }
  }

  const searchClientsFor = useCallback(async (q) => {
    const res = await api.getClients({ search: q, size: 8 })
    return res.items
  }, [])

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <GradientHeading as="h1" variant="blue" className="text-3xl mb-1">Clientes y Deudas</GradientHeading>
          <p className="text-slate-500 text-sm">
            {clients.total} clientes · Deuda pendiente: <span className="font-medium text-red-500">{formatCurrency(totalPending)}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setDebtModal(true)}><DollarSign size={16} />Nueva deuda</Button>
          <Button onClick={() => setClientModal(true)}><Plus size={16} />Nuevo cliente</Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-6">
        {[['clients', `Clientes (${clients.total})`], ['debts', `Deudas (${debts.total})`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Buscador live */}
      {tab === 'clients' && (
        <div className="mb-5 max-w-sm">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
            />
          </div>
        </div>
      )}

      
      {tab === 'clients' && (
        <>
          {clients.loading && clients.items.length === 0 ? (
            <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
          ) : clients.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Users size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400 text-sm">No hay clientes{search ? ' que coincidan' : ' registrados'}</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {clients.items.map((client) => {
                const clientDebts = debts.items.filter(d => d.customer_document === client.document)
                const pending = clientDebts
                  .filter(d => d.status === 'A')
                  .reduce((s, d) => s + Number(d.value || 0), 0)
                return (
                  <TextureCard key={client.document}>
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                        {client.name_1?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {[client.name_1, client.name_2, client.last_name_1, client.last_name_2].filter(Boolean).join(' ')}
                        </p>
                        <p className="text-xs text-slate-400">Doc: {client.document}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEdit(client) }}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex-shrink-0"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                    {client.phone_number && <p className="text-xs text-slate-400">{client.phone_number}</p>}
                    {client.address && <p className="text-xs text-slate-400 truncate">{client.address}</p>}
                    {pending > 0 && (
                      <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-100">
                        <p className="text-xs text-red-600 font-medium">Deuda pendiente: {formatCurrency(pending)}</p>
                      </div>
                    )}
                  </TextureCard>
                )
              })}
            </div>
          )}
          <Pagination page={clients.page} totalPages={clients.totalPages} loading={clients.loading} onPage={clients.goToPage} />
        </>
      )}

       
      {tab === 'debts' && (
        <>
          {debts.loading && debts.items.length === 0 ? (
            <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
          ) : debts.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <DollarSign size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-slate-400 text-sm">No hay deudas registradas</p>
            </div>
          ) : (
            <TextureCard className="p-0 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="w-9 px-5 py-3" />
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Cliente</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Descripcion</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-500">Monto</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-500">Fecha</th>
                      <th className="w-9 px-4 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {debts.items.map((debt) => {
                      const paid = debt.status === 'P'
                      const clientName = clientNameFromDoc(debt.customer_document)
                      return (
                        <tr key={debt.id} className={`hover:bg-slate-50/50 transition-colors ${paid ? 'opacity-55' : ''}`}>
                          <td className="px-5 py-3.5">
                            <button onClick={() => togglePaid(debt)} className="block">
                              {paid
                                ? <CheckCircle size={18} className="text-emerald-500" />
                                : <Circle size={18} className="text-slate-300 hover:text-indigo-400" />}
                            </button>
                          </td>
                          <td className="px-4 py-3.5 font-medium text-slate-800">{clientName}</td>
                          <td className="px-4 py-3.5 text-slate-500 text-xs">{debt.description || '—'}</td>
                          <td className={`px-4 py-3.5 text-right font-medium ${paid ? 'line-through text-slate-400' : 'text-red-600'}`}>
                            {formatCurrency(debt.value)}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 text-xs">{formatDate(debt.creation_date)}</td>
                          <td className="px-4 py-3.5">
                            <button
                              onClick={() => deleteDebt(debt.id)}
                              className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
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
          <Pagination page={debts.page} totalPages={debts.totalPages} loading={debts.loading} onPage={debts.goToPage} />
        </>
      )}

      
      <Modal open={clientModal} onClose={() => setClientModal(false)} title="Nuevo cliente">
        <form onSubmit={handleClientSubmit} className="space-y-4">
          <Input label="Documento (CC / CE) *" required value={clientForm.document} onChange={(e) => setClientForm({ ...clientForm, document: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Primer nombre *" required value={clientForm.name_1} onChange={(e) => setClientForm({ ...clientForm, name_1: e.target.value })} />
            <Input label="Segundo nombre" value={clientForm.name_2} onChange={(e) => setClientForm({ ...clientForm, name_2: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Primer apellido *" required value={clientForm.last_name_1} onChange={(e) => setClientForm({ ...clientForm, last_name_1: e.target.value })} />
            <Input label="Segundo apellido" value={clientForm.last_name_2} onChange={(e) => setClientForm({ ...clientForm, last_name_2: e.target.value })} />
          </div>
          <Input label="Telefono" value={clientForm.phone_number} onChange={(e) => setClientForm({ ...clientForm, phone_number: e.target.value })} />
          <Input label="Direccion" value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setClientModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : 'Guardar cliente'}</Button>
          </div>
        </form>
      </Modal>

      
      <Modal open={editModal} onClose={() => setEditModal(false)} title={`Editar cliente · ${editingClient?.document}`}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-500">
            Documento: <span className="font-medium text-slate-700">{editingClient?.document}</span> (no editable)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Primer nombre *" required value={editForm.name_1} onChange={(e) => setEditForm({ ...editForm, name_1: e.target.value })} />
            <Input label="Segundo nombre" value={editForm.name_2} onChange={(e) => setEditForm({ ...editForm, name_2: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Primer apellido *" required value={editForm.last_name_1} onChange={(e) => setEditForm({ ...editForm, last_name_1: e.target.value })} />
            <Input label="Segundo apellido" value={editForm.last_name_2} onChange={(e) => setEditForm({ ...editForm, last_name_2: e.target.value })} />
          </div>
          <Input label="Telefono" value={editForm.phone_number} onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })} />
          <Input label="Direccion (opcional)" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setEditModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : 'Guardar cambios'}</Button>
          </div>
        </form>
      </Modal>

      
      <Modal
        open={debtModal}
        onClose={() => { setDebtModal(false); setDebtClient(null); setDebtOrder(null); setDebtAmount(''); setDebtDesc('') }}
        title="Registrar deuda"
      >
        <form onSubmit={handleDebtSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Buscar cliente</label>
            <SearchPicker
              selected={debtClient}
              displaySelected={(c) => `${c.name_1} ${c.last_name_1}  ·  ${c.document}`}
              onSearch={searchClientsFor}
              optionLabel={(c) => `${c.name_1} ${c.last_name_1}  ·  ${c.document}`}
              onSelected={(c) => { setDebtClient(c); setDebtOrder(null); loadOrders(c) }}
              onCleared={() => { setDebtClient(null); setDebtOrder(null); setClientOrders([]) }}
              placeholder="Nombre o documento..."
            />
          </div>

          {debtClient && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Pedido asociado *</label>
              {loadingOrders ? (
                <div className="flex items-center gap-2 text-sm text-slate-400 py-2"><Loader2 size={14} className="animate-spin" /> Cargando pedidos...</div>
              ) : clientOrders.length === 0 ? (
                <p className="text-xs text-red-500">Este cliente no tiene pedidos registrados.</p>
              ) : (
                <select
                  value={debtOrder?.id_order || ''}
                  onChange={(e) => {
                    const o = clientOrders.find(x => String(x.id_order) === e.target.value)
                    setDebtOrder(o)
                    if (o) setDebtAmount(String(o.total))
                  }}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                  required
                >
                  <option value="">Seleccionar pedido...</option>
                  {clientOrders.map(o => (
                    <option key={o.id_order} value={o.id_order}>
                      Pedido #{o.id_order} · {formatCurrency(o.total)} · {o.delivery_status === 'P' ? 'En espera' : o.delivery_status === 'E' ? 'Enviado' : 'Listo'}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <Input label="Monto (COP) *" type="number" min="1" required value={debtAmount} onChange={(e) => setDebtAmount(e.target.value)} />
          <Input label="Descripcion (opcional)" value={debtDesc} onChange={(e) => setDebtDesc(e.target.value)} />

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setDebtModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={!debtClient || !debtOrder || !debtAmount || saving}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : 'Registrar deuda'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
