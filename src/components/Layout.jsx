// Layout principal con sidebar y contenido
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

// funcion Layout
export function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}