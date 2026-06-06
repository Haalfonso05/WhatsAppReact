import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Package, Search, Loader2 } from 'lucide-react'
import { GradientHeading } from '../components/cult/GradientHeading'
import { TextureCard } from '../components/cult/TextureCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Pagination } from '../components/ui/Pagination'
import { formatCurrency } from '../lib/utils'
import { api } from '../lib/api'
import { useProducts } from '../lib/hooks'

const EMPTY_FORM = { name: '', current_stock: '', reference_price: '', product_type_id: '', threshold: '5', available: 'Y' }

export default function Inventory() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [productTypes, setProductTypes] = useState([])
  const [adjusting, setAdjusting] = useState({}) 

  const { items, page, totalPages, total, loading, reload, goToPage } = useProducts({ search })

  useEffect(() => {
    api.getProductTypes().then(setProductTypes).catch(() => {})
  }, [])

  function openAdd() { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  function openEdit(item) {
    setEditing(item)
    setForm({
      name: item.name,
      current_stock: item.current_stock,
      reference_price: item.reference_price,
      product_type_id: item.product_type_id || '',
      threshold: item.threshold ?? 5,
      available: item.available || 'Y',
    })
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault(); setSaving(true)
    try {
      const data = {
        name: form.name,
        current_stock: Number(form.current_stock),
        reference_price: Number(form.reference_price),
        product_type_id: Number(form.product_type_id),
        threshold: Number(form.threshold || 5),
        available: form.available,
      }
      if (editing) await api.updateProduct(editing.id_product, data)
      else await api.createProduct(data)
      setModalOpen(false); reload()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar este producto?')) return
    try { await api.deleteProduct(id); reload() } catch (err) { console.error(err) }
  }

  async function adjustStock(id, delta) {
    setAdjusting(prev => ({ ...prev, [id]: true }))
    try { await api.adjustStock(id, delta); reload() }
    catch (err) { console.error(err) }
    finally { setAdjusting(prev => ({ ...prev, [id]: false })) }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <GradientHeading as="h1" variant="blue" className="text-3xl mb-1">Inventario</GradientHeading>
          <p className="text-slate-500 text-sm">{total} productos registrados</p>
        </div>
        <Button onClick={openAdd}><Plus size={16} />Agregar producto</Button>
      </div>

      <div className="mb-5 max-w-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
          />
        </div>
      </div>

      <TextureCard className="p-0 overflow-hidden">
        {loading && items.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400 text-sm">No hay productos{search ? ' que coincidan' : ''}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="text-left px-5 py-3 font-medium text-slate-500">Producto</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500">Categoria</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500">Stock</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500">Precio</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => {
                  const isLow = item.current_stock <= (item.threshold ?? 5)
                  const busyAdj = adjusting[item.id_product]
                  const typeLabel = productTypes.find(t => String(t.id) === String(item.product_type_id))?.name
                  return (
                    <tr key={item.id_product} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">{item.name}</td>
                      <td className="px-4 py-3.5 text-slate-500">{typeLabel || item.product_type_id || '—'}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => adjustStock(item.id_product, -1)}
                            disabled={busyAdj || item.current_stock <= 0}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 transition-colors"
                          >−</button>
                          <span className="font-medium text-slate-700 w-8 text-center">{item.current_stock}</span>
                          <button
                            onClick={() => adjustStock(item.id_product, 1)}
                            disabled={busyAdj}
                            className="w-5 h-5 rounded bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 disabled:opacity-40 transition-colors"
                          >+</button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-700">{formatCurrency(item.reference_price)}</td>
                      <td className="px-4 py-3.5 text-center">
                        {isLow ? <Badge variant="warning">Stock bajo</Badge> : <Badge variant="Listo">OK</Badge>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Pencil size={15} /></button>
                          <button onClick={() => handleDelete(item.id_product)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </TextureCard>

      <Pagination page={page} totalPages={totalPages} loading={loading} onPage={goToPage} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar producto' : 'Nuevo producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre del producto *" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Categoria *</label>
            <select
              required
              value={form.product_type_id}
              onChange={(e) => setForm({ ...form, product_type_id: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
            >
              <option value="">Seleccionar categoria...</option>
              {productTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.id})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Stock *" type="number" min="0" required value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: e.target.value })} />
            <Input label="Precio (COP) *" type="number" min="0" required value={form.reference_price} onChange={(e) => setForm({ ...form, reference_price: e.target.value })} />
          </div>

          <Input label="Umbral de alerta" type="number" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: e.target.value })} />

          <div className="flex gap-3 pt-1">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" disabled={saving}>{saving ? <Loader2 size={14} className="animate-spin" /> : editing ? 'Guardar' : 'Agregar'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
