const BASE_URL = 'https://whatsappbackend-production-b7ef.up.railway.app'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`${res.status}: ${err}`)
  }
  return res.json()
}


export const api = {

  getProducts: ({ page = 1, size = 25, search = '' } = {}) =>
    request(`/products/?page=${page}&size=${size}&search=${encodeURIComponent(search)}`),

  getAllProducts: () => request('/products/all'),

  getProduct: (id) => request(`/products/${id}`),

  createProduct: (data) => request('/products/', { method: 'POST', body: JSON.stringify(data) }),

  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),

  adjustStock: (id, delta) =>
    request(`/products/${id}/stock`, { method: 'PATCH', body: JSON.stringify({ delta }) }),

  getProductTypes: () => request('/products/types'),

  
  getClients: ({ page = 1, size = 25, search = '' } = {}) =>
    request(`/customers/?page=${page}&size=${size}&search=${encodeURIComponent(search)}`),

  getAllClients: () => request('/customers/all'),

  createClient: (data) => request('/customers/', { method: 'POST', body: JSON.stringify(data) }),

  updateClient: (document, data) =>
    request(`/customers/${document}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteClient: (document) => request(`/customers/${document}`, { method: 'DELETE' }),

  
  getOrders: ({ page = 1, size = 20, search = '', status = '' } = {}) =>
    request(`/orders/?page=${page}&size=${size}&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`),

  getOrderDetails: (id) => request(`/orders/${id}/details`),

  createOrder: (data) => request('/orders/', { method: 'POST', body: JSON.stringify(data) }),

  addOrderDetail: (orderId, data) =>
    request(`/orders/${orderId}/details`, { method: 'POST', body: JSON.stringify(data) }),

  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  deleteOrder: (id) => request(`/orders/${id}`, { method: 'DELETE' }),

  
  getDebts: ({ page = 1, size = 20 } = {}) =>
    request(`/credits/?page=${page}&size=${size}`),

  getAllDebts: () => request('/credits/all'),

  createDebt: (data) => request('/credits/', { method: 'POST', body: JSON.stringify(data) }),

  toggleDebtPaid: (id, paid) =>
    request(`/credits/${id}`, { method: 'PATCH', body: JSON.stringify({ status: paid ? 'P' : 'A' }) }),
}
