import { useLayoutEffect, useRef, useState } from 'react'
import { getSelection, matchCase, type WordSelection } from '../../lib/words'

export function useWordSelection(body: string, updateBody: (value: string) => void) {
  const [selection, setSelection] = useState<WordSelection | null>(null)
  const editor = useRef<HTMLTextAreaElement>(null)
  const anchor = useRef<HTMLElement>(null)
  const pendingCaret = useRef<WordSelection | null>(null)

  function readSelection() {
    const field = editor.current
    if (!field) return
    const next = getSelection(field.value, field.selectionStart, field.selectionEnd)
    setSelection(current => next && current?.start === next.start && current.term === next.term ? current : next)
  }

  function dismiss() {
    setSelection(null)
  }

  function close() {
    dismiss()
    const field = editor.current
    if (!field) return
    field.setSelectionRange(field.selectionEnd, field.selectionEnd)
    field.focus({ preventScroll: true })
  }

  function replace(name: string) {
    if (!selection) return
    const { start, end, term } = selection
    if (body.slice(start, end) !== term) return
    const replacement = matchCase(term, name)
    const next = { start, end: start + replacement.length, term: replacement }
    pendingCaret.current = next
    updateBody(body.slice(0, start) + replacement + body.slice(end))
    setSelection(next)
    return 'Replaced ' + term + ' with ' + replacement + '.'
  }

  useLayoutEffect(() => {
    if (!pendingCaret.current) return
    const { start, end } = pendingCaret.current
    pendingCaret.current = null
    editor.current?.setSelectionRange(start, end)
  }, [body])

  return { editor, anchor, selection, readSelection, dismiss, close, replace }
}
