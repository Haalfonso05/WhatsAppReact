import { useState, useEffect, useCallback } from 'react'
import { api } from './api'

// ── Hook genérico de paginación ───────────────────────────────────────────────

function usePaged(fetcher, deps = []) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async (p = page) => {
    setLoading(true)
    try {
      const res = await fetcher(p)
      setItems(res.items)
      setTotalPages(res.pages)
      setTotal(res.total)
      setPage(p)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetch(1) }, [fetch])

  const reload = () => fetch(page)
  const goToPage = (p) => fetch(p)

  return { items, page, totalPages, total, loading, reload, goToPage }
}

// ── Productos ─────────────────────────────────────────────────────────────────

export function useProducts({ search = '' } = {}) {
  const paged = usePaged((p) => api.getProducts({ page: p, search }), [search])
  return paged
}

// ── Clientes ──────────────────────────────────────────────────────────────────

export function useClients({ search = '' } = {}) {
  const paged = usePaged((p) => api.getClients({ page: p, search }), [search])
  return paged
}

// ── Pedidos ───────────────────────────────────────────────────────────────────

export function useOrders({ search = '', status = '' } = {}) {
  const paged = usePaged((p) => api.getOrders({ page: p, search, status }), [search, status])
  return paged
}

// ── Deudas ────────────────────────────────────────────────────────────────────

export function useDebts() {
  const paged = usePaged((p) => api.getDebts({ page: p }), [])
  return paged
}

// ── Búsqueda typeahead ────────────────────────────────────────────────────────

export function useSearch(fetcher) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (q) => {
    if (!q || q.trim().length < 2) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetcher(q.trim())
      setResults(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  return { results, loading, search, clear: () => setResults([]) }
}
