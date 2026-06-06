import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export function Pagination({ page, totalPages, loading, onPage }) {
  if (totalPages <= 1) return null

  const pages = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    let start = Math.max(2, page - 2)
    let end = Math.min(totalPages - 1, page + 2)
    if (start > 2) pages.push(-1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (end < totalPages - 1) pages.push(-1)
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-6">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1 || loading}
        className="p-1.5 rounded-lg text-indigo-600 disabled:text-slate-300 hover:bg-indigo-50 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, i) =>
        p === -1 ? (
          <span key={`ellipsis-${i}`} className="px-1 text-slate-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => !loading && p !== page && onPage(p)}
            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages || loading}
        className="p-1.5 rounded-lg text-indigo-600 disabled:text-slate-300 hover:bg-indigo-50 disabled:hover:bg-transparent transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      {loading && <Loader2 size={14} className="ml-2 animate-spin text-indigo-400" />}
    </div>
  )
}
