import { useEffect, useRef, useState, type RefObject } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '../../components/IconButton'
import { matchCase, sentenceParts, type WordSelection } from '../../lib/words'
import { useWordLookup } from './useWordLookup'
import { usesSampleData } from './thesaurus'
import { useWordPopover } from './useWordPopover'

interface WordExplorerProps {
  anchor: RefObject<HTMLElement | null>
  editor: RefObject<HTMLTextAreaElement | null>
  selection: WordSelection
  body: string
  dismiss: () => void
  close: () => void
  replace: (name: string) => void
}

function LoadingAlternatives() {
  return (
    <>
      <span className="sr-only" role="status">Loading alternatives…</span>
      <div className="motion-safe:animate-pulse" aria-hidden="true">
        {[0, 1, 2].map(row => (
          <div className="grid min-h-14 grid-cols-[minmax(0,1fr)_46px] items-center gap-4 px-3 py-2" key={row}>
            <div><i className="block h-3 w-1/3 rounded bg-slate-200" /><i className="mt-2 block h-2 w-3/4 rounded bg-slate-200" /></div>
            <i className="block h-2 w-8 justify-self-end rounded bg-slate-200" />
          </div>
        ))}
      </div>
    </>
  )
}

export function WordExplorer({ anchor, editor, selection, body, dismiss, close, replace }: WordExplorerProps) {
  const popover = useWordPopover(anchor, editor, dismiss)
  const { before, after } = sentenceParts(body, selection)
  const { term } = selection
  const { result, retry } = useWordLookup({
    term,
    sentence: before + term + after,
    start: before.length,
    end: before.length + term.length,
  })
  const [hovered, setHovered] = useState<string | null>(null)
  const [focused, setFocused] = useState<string | null>(null)
  const pendingHover = useRef<{ name: string; timer: number } | null>(null)
  const preview = hovered ?? focused
  const choices = result.entry?.alternatives ?? []
  const displayedWord = preview ? matchCase(selection.term, preview) : selection.term

  function endHover() {
    clearTimeout(pendingHover.current?.timer)
    pendingHover.current = null
    setHovered(null)
  }

  function previewOnMove(pointerType: string, name: string) {
    if (pointerType !== 'mouse' || pendingHover.current?.name === name) return
    clearTimeout(pendingHover.current?.timer)
    pendingHover.current = { name, timer: window.setTimeout(() => setHovered(name), 110) }
  }

  useEffect(() => () => clearTimeout(pendingHover.current?.timer), [])

  return (
    <aside ref={popover} id="word-explorer" className="invisible fixed left-0 top-0 z-20 w-[min(360px,calc(100vw-20px))] overflow-auto overscroll-contain rounded-xl border border-slate-200 bg-white shadow-lg motion-safe:animate-appear" aria-label="Word explorer"
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          close()
        }
      }}>
      <div className="flex items-start justify-between gap-3 pb-2 pl-[18px] pr-3 pt-4">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <h2 className="break-words font-serif text-3xl font-medium leading-none tracking-tight text-slate-800">{selection.term}</h2>
          {result.entry && <span className="font-serif text-sm italic text-slate-500">{result.entry.part}</span>}
        </div>
        <IconButton icon={X} label="Close word explorer" onClick={close} />
      </div>
      <div className="pb-1.5">
        <section className="mx-[18px] mb-3.5 border-l-2 border-blue-200 pl-3" aria-label={preview ? 'Replacement preview' : 'Sentence in context'}>
          <h3 className="mb-1 text-xs font-medium text-slate-500">{preview ? 'Replacement preview' : 'In your sentence'}</h3>
          <div className="grid break-words font-serif text-base leading-snug text-slate-700 [&>*]:col-start-1 [&>*]:row-start-1 [&_mark]:rounded-sm [&_mark]:bg-blue-50 [&_mark]:text-blue-800">
            <blockquote>{before}<mark>{displayedWord}</mark>{after}</blockquote>
            {/* Reserve the tallest preview so line wrapping never moves a row under the pointer. */}
            {[selection.term, ...choices.map(({ name }) => matchCase(selection.term, name))].map(word => (
              <span key={word} className="pointer-events-none invisible" aria-hidden="true">{before}<mark>{word}</mark>{after}</span>
            ))}
          </div>
        </section>
        <section className="border-t border-slate-200 px-1.5 pt-2" aria-busy={result.status === 'loading'}>
          <div className="flex items-baseline justify-between gap-2 px-3 pb-1">
            <h3 className="text-sm font-semibold">Replace with</h3>
            {result.entry && <span className="text-xs text-slate-500">{usesSampleData ? 'Sample match' : 'Association'}</span>}
          </div>
          {result.status === 'loading' && <LoadingAlternatives />}
          {choices.map(({ name, gloss, score }) => (
            <button key={name} className="grid w-full grid-cols-[minmax(0,1fr)_46px] items-center gap-4 rounded-lg px-3 py-2 text-left transition-colors data-[preview]:bg-blue-50 focus-visible:outline-offset-[-2px]" data-preview={preview === name || undefined}
              onClick={() => replace(name)}
              onPointerMove={event => previewOnMove(event.pointerType, name)} onPointerLeave={endHover}
              onFocus={event => {
                if (event.currentTarget.matches(':focus-visible')) {
                  endHover()
                  setFocused(name)
                }
              }}
              onBlur={() => setFocused(null)}
              aria-label={'Replace ' + selection.term + ' with ' + name}
              aria-description={gloss + '. ' + score + (usesSampleData ? '% sample association' : '% association')}>
              <span>
                <strong className="block text-[.96rem] font-semibold leading-snug text-slate-800">{matchCase(selection.term, name)}</strong><small className="mt-0.5 block text-xs leading-snug text-slate-500">{gloss}</small>
              </span>
              <span className="grid justify-items-end gap-1">
                <span className="text-sm font-medium leading-tight text-blue-800 tabular-nums">{score}%</span>
                <span className="h-[3px] w-full overflow-hidden rounded-full bg-slate-200" aria-hidden="true"><i className="block h-full rounded-full bg-blue-400" style={{ width: score + '%' }} /></span>
              </span>
            </button>
          ))}
          {result.status === 'ready' && !result.entry && (
            <p className="p-3 text-sm leading-relaxed text-slate-600">{usesSampleData ? 'This word has no entry in the sample thesaurus. Try “important,” “help,” or “show.”' : 'No alternatives found for this word in this sentence.'}</p>
          )}
          {result.status === 'error' && (
            <p className="p-3 text-sm leading-relaxed text-slate-600">The suggestions could not load. <button className="text-cobalt underline" onClick={retry}>Try again</button></p>
          )}
        </section>
      </div>
    </aside>
  )
}
