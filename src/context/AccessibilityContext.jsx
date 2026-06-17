import { createContext, useContext, useEffect, useState } from 'react'

const AccessibilityContext = createContext(null)

const CONTRAST_KEY = 'a11y_contrast'
const FONT_KEY = 'a11y_fontscale'
const MIN = 1
const MAX = 1.5
const STEP = 0.1

export function AccessibilityProvider({ children }) {
  const [contrast, setContrast] = useState(() => localStorage.getItem(CONTRAST_KEY) === '1')
  const [fontScale, setFontScale] = useState(() => {
    const v = parseFloat(localStorage.getItem(FONT_KEY))
    return Number.isNaN(v) ? 1 : v
  })

  useEffect(() => {
    document.documentElement.classList.toggle('a11y-contrast', contrast)
    localStorage.setItem(CONTRAST_KEY, contrast ? '1' : '0')
  }, [contrast])

  useEffect(() => {
    document.documentElement.style.fontSize = `${Math.round(fontScale * 100)}%`
    localStorage.setItem(FONT_KEY, String(fontScale))
  }, [fontScale])

  const incFont = () => setFontScale((s) => Math.min(MAX, Math.round((s + STEP) * 10) / 10))
  const decFont = () => setFontScale((s) => Math.max(MIN, Math.round((s - STEP) * 10) / 10))
  const reset = () => {
    setContrast(false)
    setFontScale(1)
  }

  return (
    <AccessibilityContext.Provider
      value={{ contrast, setContrast, fontScale, incFont, decFont, reset, MIN, MAX }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export function useAccessibility() {
  return useContext(AccessibilityContext)
}
