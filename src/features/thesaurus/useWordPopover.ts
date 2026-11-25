import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react'
import { autoUpdate, computePosition, flip, hide, offset, shift, size } from '@floating-ui/dom'

export function useWordPopover(
  anchor: RefObject<HTMLElement | null>,
  editor: RefObject<HTMLTextAreaElement | null>,
  dismiss: () => void,
) {
  const popover = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const word = anchor.current
    const panel = popover.current
    if (!word || !panel) return
    let active = true
    const stop = autoUpdate(word, panel, async () => {
      const { x, y, middlewareData } = await computePosition(word, panel, {
        strategy: 'fixed',
        placement: 'bottom-start',
        middleware: [
          offset(8), flip({ padding: 10 }), shift({ padding: 10 }),
          size({
            padding: 10,
            apply({ availableHeight }) {
              panel.style.maxHeight = Math.max(0, availableHeight) + 'px'
            },
          }),
          hide(),
        ],
      })
      if (active) {
        Object.assign(panel.style, {
          left: x + 'px', top: y + 'px',
          visibility: middlewareData.hide?.referenceHidden ? 'hidden' : 'visible',
        })
      }
    })
    return () => {
      active = false
      stop()
    }
  }, [anchor])

  useEffect(() => {
    function outside(event: PointerEvent) {
      const target = event.target
      if (target instanceof Node && !popover.current?.contains(target) && target !== editor.current) dismiss()
    }
    document.addEventListener('pointerdown', outside)
    return () => document.removeEventListener('pointerdown', outside)
  }, [editor, dismiss])

  return popover
}
