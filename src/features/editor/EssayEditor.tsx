import { useState, type KeyboardEvent } from 'react'
import { CloudCheck, FilePenLine, Maximize2, Minimize2, Redo2, Undo2 } from 'lucide-react'
import { IconButton } from '../../components/IconButton'
import { WordExplorer } from '../thesaurus/WordExplorer'
import type { Draft } from './draft'
import type { useDraft } from './useDraft'
import { useWordSelection } from './useWordSelection'

interface EssayEditorProps {
  document: ReturnType<typeof useDraft>
  fullscreen: boolean
  toggleFullscreen: () => void
}

export function EssayEditor({ document, fullscreen, toggleFullscreen }: EssayEditorProps) {
  const { draft, dispatch, saveState, canUndo, canRedo } = document
  const [announcement, setAnnouncement] = useState('')
  const words = useWordSelection(draft.body, body => dispatch({ type: 'commit', draft: { ...draft, body } }))
  const { selection, readSelection } = words
  const count = draft.body.trim().split(/\s+/u).filter(Boolean).length

  function edit(key: keyof Draft, value: string) {
    words.dismiss()
    dispatch({ type: 'commit', draft: { ...draft, [key]: value } })
  }

  function travel(direction: 'undo' | 'redo') {
    if (direction === 'undo' ? !canUndo : !canRedo) return
    words.dismiss()
    dispatch({ type: direction })
    setAnnouncement(direction === 'undo' ? 'Edit undone.' : 'Edit restored.')
  }

  function editorKeys(event: KeyboardEvent) {
    if (event.key === 'Escape' && selection) {
      event.preventDefault()
      event.stopPropagation()
      words.close()
      return
    }
    if (event.nativeEvent.isComposing || !(event.ctrlKey || event.metaKey)) return
    const key = event.key.toLowerCase()
    if (key === 'z' || key === 'y') {
      event.preventDefault()
      travel(key === 'y' || event.shiftKey ? 'redo' : 'undo')
    }
  }

  return (
    <>
      <section className="flex min-h-[max(480px,calc(100svh-10rem))] min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" onKeyDown={editorKeys} aria-label="Essay editor">
        <div className="flex min-h-[52px] items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 sm:px-5">
          <h1 className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight"><FilePenLine size={18} className="text-cobalt" />Essay editor</h1>
          <div className="flex items-center gap-1">
            <IconButton icon={Undo2} label="Undo edit" disabled={!canUndo} onClick={() => travel('undo')} />
            <IconButton icon={Redo2} label="Redo edit" disabled={!canRedo} onClick={() => travel('redo')} />
            <i aria-hidden="true" className="mx-1 h-4 w-px bg-slate-200" />
            <IconButton icon={fullscreen ? Minimize2 : Maximize2} label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              aria-pressed={fullscreen} onClick={toggleFullscreen} />
          </div>
        </div>
        <div className="flex w-full flex-1 flex-col px-5 py-7 sm:px-[clamp(24px,3.5vw,58px)] sm:py-[clamp(28px,3.25vw,48px)]">
          <label className="sr-only" htmlFor="essay-title">Essay title</label>
          <input id="essay-title" className="w-full bg-transparent font-serif text-[clamp(1.95rem,2.9vw,2.85rem)] font-medium leading-tight tracking-[-.045em] placeholder:text-slate-400 focus:outline-none" placeholder="Untitled essay"
            value={draft.title} onChange={event => edit('title', event.target.value)} />
          <div className="mb-6 mt-4 h-0.5 w-10 bg-blue-500/80" />
          <div className="relative min-h-60 flex-1 whitespace-pre-wrap break-words font-serif text-[clamp(1.09rem,1.4vw,1.28rem)] leading-[1.67] [tab-size:4]">
            <div className="pointer-events-none select-none text-transparent" aria-hidden="true">
              {selection ? <>
                {draft.body.slice(0, selection.start)}<mark ref={words.anchor} className="rounded-sm bg-blue-100 text-transparent shadow-[0_1px_0_#7799ea]">{selection.term}</mark>{draft.body.slice(selection.end)}
              </> : draft.body}{'\u200b'}
            </div>
            <textarea ref={words.editor} className="absolute inset-0 size-full resize-none overflow-hidden whitespace-pre-wrap break-words rounded-none bg-transparent text-slate-700 caret-cobalt placeholder:text-slate-400 selection:bg-blue-200 focus:outline-none" aria-controls={selection ? 'word-explorer' : undefined}
              aria-label="Essay text" placeholder="Start writing your essay…" value={draft.body}
              onChange={event => edit('body', event.target.value)} onSelect={readSelection} onPointerUp={readSelection}
              onKeyUp={event => { if (event.key === 'Shift' || event.key.startsWith('Arrow')) readSelection() }} />
          </div>
        </div>
        <div className="flex min-h-11 items-center justify-between gap-3 border-t border-slate-200 bg-gray-50/50 px-4 py-2 text-xs text-slate-500 sm:px-5">
          <span className="inline-flex items-center gap-2"><CloudCheck size={15} className="text-emerald-800/60" />{saveState}</span>
          <span className="inline-flex items-center gap-2">{count} {count === 1 ? 'word' : 'words'}<i className="mx-1 size-[3px] rounded-full bg-slate-400" />English</span>
        </div>
      </section>
      {selection && <WordExplorer key={selection.start + ':' + selection.term} anchor={words.anchor} editor={words.editor}
        selection={selection} body={draft.body} dismiss={words.dismiss} close={words.close}
        replace={name => setAnnouncement(words.replace(name) ?? '')} />}
      <span className="sr-only" role="status">{announcement}</span>
    </>
  )
}
