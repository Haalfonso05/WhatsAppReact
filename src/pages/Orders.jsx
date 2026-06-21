// Pantalla de pedidos
import { useState, useCallback, useEffect, useRef } from 'react'
import { Plus, ShoppingCart, ChevronRight, X, Loader2, Check } from 'lucide-react'
import { GradientHeading } from '../components/cult/GradientHeading'
import { TextureCard } from '../components/cult/TextureCard'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { Pagination } from '../components/ui/Pagination'
import { SearchPicker } from '../components/ui/SearchPicker'
import { formatCurrency, formatDate } from '../lib/utils'
import { api } from '../lib/api'
import { useOrders } from '../lib/hooks'

const STATUSES = ['En espera', 'Enviado', 'Listo']
const DB_TO_DISPLAY = { P: 'En espera', E: 'Enviado', D: 'Listo' }
const DISPLAY_TO_DB = { 'En espera': 'P', 'Enviado': 'E', 'Listo': 'D' }
const STATUS_COLORS = {
  'En espera': { dot: 'bg-amber-500', line: 'bg-amber-400', text: 'text-amber-600' },
  'Enviado':   { dot: 'bg-indigo-500', line: 'bg-indigo-400', text: 'text-indigo-600' },
  'Listo':     { dot: 'bg-emerald-500', line: 'bg-emerald-400', text: 'text-emerald-600' },
}


const checkedByOrder = {}



// funcion OrderStepper
function OrderStepper({ dbStatus, onAdvance }) {
  const display = DB_TO_DISPLAY[dbStatus] || 'En espera'
  const cur = STATUSES.indexOf(display)
  return (
    <div className="flex items-center gap-1">
      {STATUSES.map((s, i) => {
        const done   = i < cur
        const active = i === cur
        const isNext = i === cur + 1
        return (
          <div key={s} className="flex items-center gap-1">
            <button
              disabled={!isNext}
              onClick={() => onAdvance(s)}
              title={isNext ? `Avanzar a ${s}` : s}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all
                ${done   ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                ${active ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                ${isNext ? 'border-indigo-300 text-indigo-400 hover:bg-indigo-50 cursor-pointer' : ''}
                ${!done && !active && !isNext ? 'border-slate-200 text-slate-300' : ''}
              `}>
              {done ? '✓' : isNext ? <ChevronRight size={10} /> : null}
            </button>
            {i < STATUSES.length - 1 && (
              <div className={`w-5 h-0.5 ${i < cur ? 'bg-emerald-400' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}



// funcion OrderDetailDialog
function OrderDetailDialog({ order, open, onClose, onAdvance, onStatusChange }) {
  const [details, setDetails] = useState([])
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState({})
  const [inventory, setInventory] = useState([])

  const display = DB_TO_DISPLAY[order.delivery_status] || 'En espera'

  useEffect(() => {
    if (!open) return
    setLoading(true)
    Promise.all([
      api.getOrderDetails(order.id_order),
      fetch('https://whatsappbackend-production-b7ef.up.railway.app/products/all').then(r => r.json()),
    ]).then(([dets, inv]) => {
      const detList = Array.isArray(dets) ? dets : []
      setDetails(detList)
      setInventory(Array.isArray(inv) ? inv : [])
      
      if (display === 'Enviado' || display === 'Listo') {
        const allChecked = {}
        detList.forEach((_, i) => { allChecked[i] = true })
        setChecked(allChecked)
        checkedByOrder[order.id_order] = allChecked
      } else {
        const saved = checkedByOrder[order.id_order] || {}
        setChecked(saved)
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [open, order.id_order, display])

  // funcion toggleCheck
  function toggleCheck(i) {
    const next = { ...checked, [i]: !checked[i] }
    setChecked(next)
    checkedByOrder[order.id_order] = next
  }

  // funcion getStock
  function getStock(productId) {
    const item = inventory.find(p => String(p.id_product) === String(productId))
    return item?.current_stock ?? null
  }

  const allChecked = details.length > 0 && details.every((_, i) => {
    if (display === 'Listo') return true
    return checked[i] === true
  })
  const checkedCount = display === 'Listo' ? details.length : Object.values(checked).filter(Boolean).length

  async function handleMarkAs(nextStatus) {
    await onAdvance(order.id_order, nextStatus)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-7 relative"
        onClick={e => e.stopPropagation()}
      >
        
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-lg font-bold text-slate-900">{order.client_name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.application_date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={display}>{display}</Badge>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        <hr className="border-slate-100 mb-4" />

        
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-500">Productos</p>
          {!loading && details.length > 0 && (
            <p className="text-xs text-slate-400">{checkedCount}/{details.length} listos</p>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 size={22} className="animate-spin text-indigo-400" /></div>
        ) : details.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">Sin detalle de productos</p>
        ) : (
          <div className="space-y-1 mb-4">
            {details.map((d, i) => {
              const productId = d.product_id
              const amount = d.amount
              const name = d.product_name || String(productId)
              const subtotal = d.subtotal || 0
              const isListo = display === 'Listo'
              const isInteractive = display === 'En espera' || display === 'Enviado'
              const isChecked = isListo ? true : (checked[i] === true)
              const currentStock = getStock(productId)
              const hasStock = isListo ? true : (currentStock === null || currentStock >= amount)

              return (
                <button
                  key={i}
                  type="button"
                  disabled={!hasStock || !isInteractive}
                  onClick={() => hasStock && isInteractive && toggleCheck(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    hasStock && isInteractive ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'
                  }`}
                >
                  
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    !hasStock
                      ? 'bg-red-50 border-red-400'
                      : isChecked
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'bg-white border-slate-300'
                  }`}>
                    {!hasStock
                      ? <X size={11} className="text-red-500" />
                      : isChecked
                        ? <Check size={11} className="text-white" />
                        : null}
                  </div>

                  
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm transition-colors ${isChecked ? 'line-through text-slate-400' : 'text-slate-700'}`}>{name}</p>
                    {!hasStock && (
                      <p className="text-xs text-red-500">
                        Stock insuficiente — hay {currentStock}, se necesitan {amount}
                      </p>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 shrink-0">x{amount}</span>
                  <span className={`text-sm font-semibold shrink-0 ${isChecked ? 'text-slate-400' : 'text-slate-800'}`}>
                    {formatCurrency(subtotal)}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        <hr className="border-slate-100 mb-4" />

        
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-slate-600">Total</span>
          <span className="text-base font-bold text-slate-900">{formatCurrency(order.total)}</span>
        </div>

        {order.observation && (
          <p className="text-xs text-slate-400 italic mb-4">"{order.observation}"</p>
        )}

        
        {display === 'En espera' && details.length > 0 && (
          <div className="mt-4">
            <Button className="w-full" disabled={!allChecked} onClick={() => handleMarkAs('Enviado')}>
              Marcar como Enviado
            </Button>
          </div>
        )}
        {display === 'Enviado' && details.length > 0 && (
          <div className="mt-4">
            <Button className="w-full" disabled={!allChecked} onClick={() => handleMarkAs('Listo')}>
              Marcar como Listo
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}



// funcion OrderCard
function OrderCard({ order, onAdvance, onCancel, onClick }) {
  const display = DB_TO_DISPLAY[order.delivery_status] || 'En espera'

  // funcion handleCardClick
  function handleCardClick(e) {
    
    if (e.target.closest('[data-no-dialog]')) return
    onClick()
  }

  return (
    <TextureCard className="flex flex-col gap-3 h-full cursor-pointer" onClick={handleCardClick}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-900">{order.client_name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(order.application_date)}</p>
        </div>
        <Badge variant={display}>{display}</Badge>
      </div>
      <div className="text-sm text-slate-600 space-y-1">
        <p><span className="text-slate-400">Producto:</span> {order.product_name || '—'}</p>
        <p><span className="text-slate-400">Total:</span> <span className="font-medium text-slate-800">{formatCurrency(order.total)}</span></p>
        {order.observation && <p className="text-slate-400 text-xs italic">"{order.observation}"</p>}
      </div>
      
      <div data-no-dialog className="flex items-center gap-2 pt-1 mt-auto border-t border-slate-100">
        <div className="flex-1">
          <OrderStepper dbStatus={order.delivery_status} onAdvance={onAdvance} />
        </div>
        {display === 'En espera' && (
          <button onClick={onCancel} className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>
    </TextureCard>
  )
}



// funcion NewOrderModal
function NewOrderModal({ open, onClose, onCreated }) {
  const [selectedClient, setSelectedClient] = useState(null)
  const [lines, setLines] = useState([{ item: null, quantity: 1 }])
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // funcion reset
  function reset() { setSelectedClient(null); setLines([{ item: null, quantity: 1 }]); setNotes(''); setError('') }
  // funcion handleClose
  function handleClose() { reset(); onClose() }

  const total = lines.reduce((s, l) => l.item ? s + l.item.reference_price * l.quantity : s, 0)
  const canSubmit = selectedClient && lines.every(l => l.item) && !saving

  const searchClients = useCallback(async (q) => {
    const res = await api.getClients({ search: q, size: 8 })
    return res.items
  }, [])

  const searchProducts = useCallback(async (q) => {
    const res = await api.getProducts({ search: q, size: 8 })
    return res.items
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true); setError('')
    try {
      const order = await api.createOrder({
        customer_document: selectedClient.document,
        application_date: new Date().toISOString().split('T')[0],
        shipment_date: new Date().toISOString().split('T')[0],
        total,
        payment_method_id: 1,
      })
      for (const line of lines) {
        await api.addOrderDetail(order.id_order, {
          order_id: order.id_order,
          customer_document: selectedClient.document,
          product_id: line.item.id_product,
          amount: line.quantity,
          sale_price: line.item.reference_price,
          subtotal: line.item.reference_price * line.quantity,
        })
      }
      onCreated(); handleClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nuevo pedido" className="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Buscar cliente</label>
          <SearchPicker
            selected={selectedClient}
            displaySelected={(c) => `${c.name_1} ${c.last_name_1}  ·  ${c.document}`}
            onSearch={searchClients}
            optionLabel={(c) => `${c.name_1} ${c.last_name_1}  ·  ${c.document}`}
            onSelected={setSelectedClient}
            onCleared={() => setSelectedClient(null)}
            placeholder="Nombre o documento..."
          />
        </div>

        <div>
          <div className="grid grid-cols-[1fr_88px_20px] gap-2 mb-1 px-0.5">
            <span className="text-xs font-medium text-slate-500">Producto</span>
            <span className="text-xs font-medium text-slate-500 text-center">Cant.</span>
            <span />
          </div>
          {lines.map((line, i) => (
            <div key={i} className="grid grid-cols-[1fr_88px_20px] gap-2 mb-2 items-start">
              <SearchPicker
                selected={line.item}
                displaySelected={(p) => p.name}
                onSearch={searchProducts}
                optionLabel={(p) => `${p.name}  ·  ${new Intl.NumberFormat('es-CO').format(p.reference_price)}  ·  ${p.current_stock} uds`}
                optionDisabled={(p) => p.current_stock <= 0}
                onSelected={(p) => setLines(lines.map((l, j) => j === i ? { ...l, item: p, quantity: 1 } : l))}
                onCleared={() => setLines(lines.map((l, j) => j === i ? { ...l, item: null, quantity: 1 } : l))}
                placeholder="Buscar producto..."
              />
              <div className="flex items-center justify-center gap-1 pt-1">
                <button type="button" onClick={() => setLines(lines.map((l, j) => j === i && l.quantity > 1 ? { ...l, quantity: l.quantity - 1 } : l))}
                  className="w-6 h-6 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm">−</button>
                <span className="text-sm font-semibold w-5 text-center text-slate-800">{line.quantity}</span>
                <button type="button" onClick={() => setLines(lines.map((l, j) => j === i && (!l.item || l.quantity < l.item.current_stock) ? { ...l, quantity: l.quantity + 1 } : l))}
                  className="w-6 h-6 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-sm">+</button>
              </div>
              {lines.length > 1 && (
                <button type="button" onClick={() => setLines(lines.filter((_, j) => j !== i))}
                  className="pt-2 text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setLines([...lines, { item: null, quantity: 1 }])}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 mt-1">
            <Plus size={12} /> Agregar producto
          </button>
        </div>

        <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
          <span className="text-sm font-semibold text-slate-600">Total</span>
          <span className="text-base font-bold text-slate-900">{formatCurrency(total)}</span>
        </div>

        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas (opcional)" rows={2}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 resize-none" />

        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-1">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>Cancelar</Button>
          <Button type="submit" className="flex-1" disabled={!canSubmit}>
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Crear pedido'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}



// funcion Orders
export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailOrder, setDetailOrder] = useState(null)
  const { items: orders, page, totalPages, total, loading, reload, goToPage } = useOrders({ status: statusFilter })

  async function handleAdvance(orderId, nextStatus) {
    try {
      await api.updateOrderStatus(orderId, nextStatus)
      
      reload()
    } catch (e) {
      console.error('Error actualizando estado:', e)
    }
  }

  async function handleCancel(orderId) {
    try { await api.updateOrderStatus(orderId, 'Cancelado'); reload() }
    catch (e) { console.error(e) }
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <GradientHeading as="h1" variant="blue" className="text-3xl mb-1">Pedidos</GradientHeading>
          <p className="text-slate-500 text-sm">{total} pedidos en total</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus size={16} />Nuevo pedido</Button>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ label: 'Todos', value: '' }, ...STATUSES.map(s => ({ label: s, value: s }))].map(({ label, value }) => (
          <button key={label} onClick={() => setStatusFilter(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              statusFilter === value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
            }`}>{label}</button>
        ))}
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-indigo-400" /></div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <ShoppingCart size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-slate-400 text-sm">No hay pedidos{statusFilter ? ` con estado "${statusFilter}"` : ''}</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {orders.map((order) => (
              <OrderCard
                key={order.id_order}
                order={order}
                onClick={() => setDetailOrder(order)}
                onAdvance={(next) => handleAdvance(order.id_order, next)}
                onCancel={() => handleCancel(order.id_order)}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} loading={loading} onPage={goToPage} />
        </>
      )}

      <NewOrderModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={reload} />

      {detailOrder && (
        <OrderDetailDialog
          order={detailOrder}
          open={!!detailOrder}
          onClose={() => setDetailOrder(null)}
          onAdvance={handleAdvance}
          onStatusChange={reload}
        />
      )}
    </div>
  )
}