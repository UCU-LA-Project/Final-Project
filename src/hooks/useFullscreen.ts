import { useEffect, useRef, useState } from 'react'

export function useFullscreen() {
  const workspace = useRef<HTMLDivElement>(null)
  const [fallback, setFallback] = useState(false)
  const [native, setNative] = useState(false)

  useEffect(() => {
    const sync = () => setNative(document.fullscreenElement === workspace.current)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [])

  useEffect(() => {
    if (!fallback) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setFallback(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [fallback])

  async function toggle() {
    if (!workspace.current) return
    if (fallback) { setFallback(false); return }
    if (document.fullscreenElement === workspace.current) {
      await document.exitFullscreen()
      return
    }
    try {
      await workspace.current.requestFullscreen()
    } catch {
      // Embedded previews and some mobile browsers only allow a viewport overlay.
      setFallback(true)
    }
  }

  return { workspace, fullscreen: native || fallback, toggle }
}
