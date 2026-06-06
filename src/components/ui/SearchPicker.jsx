import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'

export function SearchPicker({
  label,
  selected,
  displaySelected,
  onSearch,
  optionLabel,
  onSelected,
  onCleared,
  optionDisabled,
  placeholder,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setTimeout(() => setOpen(false), 150)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(timeoutRef.current)
    if (q.trim().length < 2) { setResults([]); setOpen(false); return }
    timeoutRef.current = setTimeout(async () => {
      setLoading(true); setOpen(true)
      try {
        const res = await onSearch(q.trim())
        setResults(res)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }, 300)
  }

  function handleSelect(item) {
    setQuery('')
    setResults([])
    setOpen(false)
    onSelected(item)
  }

  if (selected) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-indigo-400 bg-indigo-50 text-sm text-slate-800">
        <span className="flex-1">{displaySelected(selected)}</span>
        <button onClick={() => { setQuery(''); onCleared() }} className="text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder={placeholder || label}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
        />
        {loading
          ? <Loader2 size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" />
          : <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        }
      </div>

      {open && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-52 overflow-y-auto">
          {results.map((item, i) => {
            const disabled = optionDisabled?.(item) ?? false
            return (
              <button
                key={i}
                type="button"
                disabled={disabled}
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                  disabled
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                }`}
              >
                {optionLabel(item)}
                {disabled && <span className="ml-2 text-xs text-red-400">Sin stock</span>}
              </button>
            )
          })}
        </div>
      )}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg px-3 py-2.5 text-sm text-slate-400">
          Sin resultados
        </div>
      )}
    </div>
  )
}
