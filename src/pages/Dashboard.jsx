import { useMemo } from 'react'
import { TrendingUp, DollarSign, AlertTriangle, Package } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { AnimatedNumber } from '../components/cult/AnimatedNumber'
import { GradientHeading } from '../components/cult/GradientHeading'
import { TextureCard } from '../components/cult/TextureCard'
import { Badge } from '../components/ui/Badge'
import { today, currentMonth, formatCurrency } from '../lib/utils'

const LOW_STOCK_THRESHOLD = 5

function MetricCard({ label, value, icon: Icon, color, prefix = '', formatFn }) {
  return (
    <TextureCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">
            {prefix}
            <AnimatedNumber value={value} formatFn={formatFn} />
          </p>
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </TextureCard>
  )
}

export default function Dashboard() {
  const { sales, inventory } = useApp()
  const { user } = useAuth()

  const todaySales = useMemo(
    () => sales.filter((s) => s.date.startsWith(today())).reduce((sum, s) => sum + s.amount, 0),
    [sales]
  )
  const monthSales = useMemo(
    () => sales.filter((s) => s.date.startsWith(currentMonth())).reduce((sum, s) => sum + s.amount, 0),
    [sales]
  )
  const lowStock = useMemo(
    () => inventory.filter((i) => i.stock <= LOW_STOCK_THRESHOLD),
    [inventory]
  )

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <GradientHeading as="h1" variant="blue" className="text-3xl mb-1">
          Dashboard
        </GradientHeading>
        <p className="text-slate-500 text-sm">Bienvenido de vuelta, {user?.name}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">
        <MetricCard
          label="Ventas del día"
          value={todaySales}
          icon={DollarSign}
          color="bg-emerald-50 text-emerald-600"
          formatFn={(v) => formatCurrency(v)}
        />
        <MetricCard
          label="Ventas del mes"
          value={monthSales}
          icon={TrendingUp}
          color="bg-indigo-50 text-indigo-600"
          formatFn={(v) => formatCurrency(v)}
        />
        <MetricCard
          label="Productos con stock bajo"
          value={lowStock.length}
          icon={Package}
          color="bg-amber-50 text-amber-600"
          formatFn={(v) => Math.round(v).toString()}
        />
      </div>

      {/* Low stock alerts */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-amber-500" />
          <h2 className="text-base font-semibold text-slate-800">Alertas de inventario bajo</h2>
        </div>

        {lowStock.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-400 text-sm">Todos los productos tienen stock suficiente</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-amber-100 bg-amber-50/50 overflow-hidden">
            <div className="divide-y divide-amber-100">
              {lowStock.map((product) => (
                <div key={product.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Package size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.category || 'Sin categoría'}</p>
                    </div>
                  </div>
                  <Badge variant="warning">
                    {product.stock} unidades
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
