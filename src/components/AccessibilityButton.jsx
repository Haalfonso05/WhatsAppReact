// Boton flotante y panel de accesibilidad
import { useState } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'

const ACCENT = '#10B981'
const INK = '#0F172A'
const BORDER = '#E2E8F0'
const MUTED = '#64748B'

// funcion AccessibilityButton
export function AccessibilityButton() {
  const [open, setOpen] = useState(false)
  const { contrast, setContrast, fontScale, incFont, decFont, reset, MIN, MAX } = useAccessibility()

  return (
    <div data-a11y-keep style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999 }}>
      {open && (
        <div
          style={{
            width: 250,
            marginBottom: 10,
            padding: '14px 16px',
            background: '#fff',
            border: `1px solid ${BORDER}`,
            borderRadius: 18,
            boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 12 }}>
            Accesibilidad
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 14, color: INK }}>Alto contraste</span>
            <button
              onClick={() => setContrast((v) => !v)}
              aria-pressed={contrast}
              style={{
                width: 46,
                height: 26,
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                background: contrast ? ACCENT : '#CBD5E1',
                position: 'relative',
                transition: 'background .15s',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: contrast ? 23 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left .15s',
                }}
              />
            </button>
          </div>

          <div style={{ fontSize: 14, color: INK, marginBottom: 8 }}>Tamaño de texto</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <StepBtn label="A-" disabled={fontScale <= MIN} onClick={decFont} />
            <span style={{ flex: 1, textAlign: 'center', fontWeight: 600, color: INK }}>
              {Math.round(fontScale * 100)}%
            </span>
            <StepBtn label="A+" disabled={fontScale >= MAX} onClick={incFont} />
          </div>

          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <button
              onClick={reset}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: MUTED,
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              Restablecer
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Opciones de accesibilidad"
        title="Accesibilidad"
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: ACCENT,
          color: '#fff',
          fontSize: 26,
          boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 'auto',
        }}
      >
        {open ? (
          '✕'
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
            <path d="M20.5 6c-2.61.7-5.67 1-8.5 1s-5.89-.3-8.5-1L3 8c1.86.5 4 .83 6 1v13h2v-6h2v6h2V9c2-.17 4.14-.5 6-1l-.5-2zM12 6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
          </svg>
        )}
      </button>
    </div>
  )
}

// funcion StepBtn
function StepBtn({ label, disabled, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 44,
        height: 38,
        borderRadius: 10,
        border: 'none',
        cursor: disabled ? 'default' : 'pointer',
        background: disabled ? '#E2E8F0' : ACCENT,
        color: disabled ? MUTED : '#fff',
        fontSize: 16,
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  )
}