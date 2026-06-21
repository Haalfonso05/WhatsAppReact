import { useEffect, useRef, useState } from 'react'

// funcion AnimatedNumber
export function AnimatedNumber({ value, duration = 600, formatFn = (v) => Math.round(v).toLocaleString('es-MX') }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    const start = prev.current
    const end = value
    prev.current = value
    if (start === end) return

    const startTime = performance.now()
    let frame

    // funcion tick
    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (end - start) * ease)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <span ref={ref}>{formatFn(display)}</span>
}
