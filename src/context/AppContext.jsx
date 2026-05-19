import { createContext, useContext, useState, useEffect } from 'react'
import {
  inventoryStorage,
  ordersStorage,
  clientsStorage,
  debtsStorage,
  salesStorage,
} from '../lib/storage'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [debts, setDebts] = useState([])
  const [sales, setSales] = useState([])

  useEffect(() => {
    setInventory(inventoryStorage.getAll())
    setOrders(ordersStorage.getAll())
    setClients(clientsStorage.getAll())
    setDebts(debtsStorage.getAll())
    setSales(salesStorage.getAll())
  }, [])

  // Inventory
  function addInventoryItem(item) {
    const created = inventoryStorage.add(item)
    setInventory((prev) => [...prev, created])
  }
  function updateInventoryItem(id, changes) {
    inventoryStorage.update(id, changes)
    setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, ...changes } : i)))
  }
  function removeInventoryItem(id) {
    inventoryStorage.remove(id)
    setInventory((prev) => prev.filter((i) => i.id !== id))
  }

  // Orders
  function addOrder(order) {
    const created = ordersStorage.add(order)
    setOrders((prev) => [...prev, created])
  }
  function updateOrderStatus(id, status) {
    ordersStorage.updateStatus(id, status)
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
  }
  function removeOrder(id) {
    ordersStorage.remove(id)
    setOrders((prev) => prev.filter((o) => o.id !== id))
  }

  // Clients
  function addClient(client) {
    const created = clientsStorage.add(client)
    setClients((prev) => [...prev, created])
    return created
  }
  function removeClient(id) {
    clientsStorage.remove(id)
    setClients((prev) => prev.filter((c) => c.id !== id))
  }

  // Debts
  function addDebt(debt) {
    const created = debtsStorage.add(debt)
    setDebts((prev) => [...prev, created])
  }
  function toggleDebtPaid(id) {
    debtsStorage.togglePaid(id)
    setDebts((prev) => prev.map((d) => (d.id === id ? { ...d, paid: !d.paid } : d)))
  }
  function removeDebt(id) {
    debtsStorage.remove(id)
    setDebts((prev) => prev.filter((d) => d.id !== id))
  }

  // Sales
  function addSale(sale) {
    const created = salesStorage.add(sale)
    setSales((prev) => [...prev, created])
  }

  return (
    <AppContext.Provider
      value={{
        inventory,
        orders,
        clients,
        debts,
        sales,
        addInventoryItem,
        updateInventoryItem,
        removeInventoryItem,
        addOrder,
        updateOrderStatus,
        removeOrder,
        addClient,
        removeClient,
        addDebt,
        toggleDebtPaid,
        removeDebt,
        addSale,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
