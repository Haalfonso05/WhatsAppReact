import { useState } from 'react'
import { Plus, Pencil, Trash2, Package, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { GradientHeading } from '../components/cult/GradientHeading'
import { TextureCard } from '../components/cult/TextureCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { formatCurrency } from '../lib/utils'

const EMPTY_FORM = { name: '', category: '', stock: '', price: '', threshold: '5' }

export default function Inventory() {
  const { inventory, addInventoryItem, updateInventoryItem, removeInventoryItem } = useApp()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const filtered = inventory.filter((i) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.category || '').toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  function openEdit(item) { setEditing(item); setForm({ name: item.name, category: item.category || '', stock: item.stock, price: item.price, threshold: item.threshold || '5' }); setModalOpen(true) }

  function handleSubmit(e) {
    e.preventDefault()
    const data = { name: form.name, category: form.category, stock: Number(form.stock), price: Number(form.price), threshold: Number(form.threshold) }
    if (editing) { updateInventoryItem(editing.id, data) }
    else { addInventoryItem(data) }
    setModalOpen(false)
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <GradientHeading as="h1" variant="blue" className="text-3xl mb-1">Inventario</GradientHeading>
          <p className="text-slate-500 text-sm">{inventory.length} productos registrados</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} />Agregar producto</Button>
      </div>

      {/* Search */}
      <div className="mb-5 relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
        />
      </div>

      {/* Table */}
      <TextureCard className="p-0 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 text-sm">No hay productos{search ? ' que coincidan' : ' registrados'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Categoría</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Precio</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {filtered.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-medium text-slate-800">{item.name}</td>
                      <td className="px-4 py-3.5 text-slate-500">{item.category || '—'}</td>
                      <td className="px-4 py-3.5 text-right font-medium text-slate-700">{item.stock}</td>
                      <td className="px-4 py-3.5 text-right text-slate-700">{formatCurrency(item.price)}</td>
                      <td className="px-4 py-3.5 text-right">
                        {item.stock <= (item.threshold ?? 5) ? (
                          <Badge variant="warning">Stock bajo</Badge>
                        ) : (
                          <Badge variant="Listo">OK</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => removeInventoryItem(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </TextureCard>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre del producto" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input label="Categoría" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock" type="number" min="0" required value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <Input label="Precio (MXN)" type="number" min="0" step="0.01" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <Input label="Umbral de alerta" type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1">{editing ? 'Guardar' : 'Agregar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
