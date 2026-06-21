// Persistencia local con localStorage
const KEYS = {
  USERS: 'mgmt_users',
  CURRENT_USER: 'mgmt_current_user',
  INVENTORY: 'mgmt_inventory',
  ORDERS: 'mgmt_orders',
  CLIENTS: 'mgmt_clients',
  DEBTS: 'mgmt_debts',
  SALES: 'mgmt_sales',
}

// funcion get
function get(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// funcion set
function set(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Auth
export const authStorage = {
  getUsers: () => get(KEYS.USERS, []),
  saveUser: (user) => {
    const users = authStorage.getUsers()
    users.push(user)
    set(KEYS.USERS, users)
  },
  findUser: (email, password) =>
    authStorage.getUsers().find((u) => u.email === email && u.password === password) || null,
  emailExists: (email) => authStorage.getUsers().some((u) => u.email === email),
  getCurrentUser: () => get(KEYS.CURRENT_USER),
  setCurrentUser: (user) => set(KEYS.CURRENT_USER, user),
  clearCurrentUser: () => localStorage.removeItem(KEYS.CURRENT_USER),
}

// Inventory
export const inventoryStorage = {
  getAll: () => get(KEYS.INVENTORY, []),
  save: (items) => set(KEYS.INVENTORY, items),
  add: (item) => {
    const items = inventoryStorage.getAll()
    const newItem = { ...item, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    items.push(newItem)
    set(KEYS.INVENTORY, items)
    return newItem
  },
  update: (id, changes) => {
    const items = inventoryStorage.getAll().map((i) => (i.id === id ? { ...i, ...changes } : i))
    set(KEYS.INVENTORY, items)
  },
  remove: (id) => set(KEYS.INVENTORY, inventoryStorage.getAll().filter((i) => i.id !== id)),
}

// Orders
export const ordersStorage = {
  getAll: () => get(KEYS.ORDERS, []),
  add: (order) => {
    const orders = ordersStorage.getAll()
    const newOrder = {
      ...order,
      id: crypto.randomUUID(),
      status: 'En espera',
      createdAt: new Date().toISOString(),
    }
    orders.push(newOrder)
    set(KEYS.ORDERS, orders)
    return newOrder
  },
  updateStatus: (id, status) => {
    const orders = ordersStorage.getAll().map((o) => (o.id === id ? { ...o, status } : o))
    set(KEYS.ORDERS, orders)
  },
  remove: (id) => set(KEYS.ORDERS, ordersStorage.getAll().filter((o) => o.id !== id)),
}

// Clients
export const clientsStorage = {
  getAll: () => get(KEYS.CLIENTS, []),
  add: (client) => {
    const clients = clientsStorage.getAll()
    const newClient = { ...client, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
    clients.push(newClient)
    set(KEYS.CLIENTS, clients)
    return newClient
  },
  remove: (id) => set(KEYS.CLIENTS, clientsStorage.getAll().filter((c) => c.id !== id)),
}

// Debts
export const debtsStorage = {
  getAll: () => get(KEYS.DEBTS, []),
  add: (debt) => {
    const debts = debtsStorage.getAll()
    const newDebt = {
      ...debt,
      id: crypto.randomUUID(),
      paid: false,
      createdAt: new Date().toISOString(),
    }
    debts.push(newDebt)
    set(KEYS.DEBTS, debts)
    return newDebt
  },
  togglePaid: (id) => {
    const debts = debtsStorage.getAll().map((d) => (d.id === id ? { ...d, paid: !d.paid } : d))
    set(KEYS.DEBTS, debts)
  },
  remove: (id) => set(KEYS.DEBTS, debtsStorage.getAll().filter((d) => d.id !== id)),
}

// Sales
export const salesStorage = {
  getAll: () => get(KEYS.SALES, []),
  add: (sale) => {
    const sales = salesStorage.getAll()
    const newSale = { ...sale, id: crypto.randomUUID(), date: new Date().toISOString() }
    sales.push(newSale)
    set(KEYS.SALES, sales)
    return newSale
  },
}