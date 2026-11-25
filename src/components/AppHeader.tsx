import { useEffect, useRef, useState } from 'react'
import { ArrowDownToLine, BookOpenText, Check, CircleHelp, X } from 'lucide-react'
import { IconButton } from './IconButton'
import { usesSampleData } from '../features/thesaurus/thesaurus'

interface AppHeaderProps {
  fullscreen: boolean
  onExport: () => void
}

export function AppHeader({ fullscreen, onExport }: AppHeaderProps) {
  const dialog = useRef<HTMLDialogElement>(null)
  const timer = useRef<number | undefined>(undefined)
  const [exported, setExported] = useState(false)

  useEffect(() => () => clearTimeout(timer.current), [])

  function exportEssay() {
    onExport()
    setExported(true)
    clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setExported(false), 1800)
  }

  return <>
    <header className="border-b border-slate-200 bg-white" inert={fullscreen}>
      <div className="container flex min-h-[60px] items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 font-serif text-[1.65rem] font-semibold leading-none tracking-[-.075em] sm:text-3xl">
          <span className="grid size-8 place-items-center rounded-lg rounded-br rounded-tl bg-cobalt text-white"><BookOpenText size={23} strokeWidth={1.75} /></span>
          <span>Lexicon</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
          <button className="inline-flex min-h-8 items-center gap-2 text-sm text-slate-600 hover:text-cobalt" aria-label="Quick guide" onClick={() => dialog.current?.showModal()}>
            <CircleHelp size={16} /><span className="hidden sm:inline">Quick guide</span>
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-cobalt px-3 py-2 text-sm font-medium text-white hover:bg-blue-800" onClick={exportEssay}>
            {exported ? <Check size={16} /> : <ArrowDownToLine size={16} />}
            <span>{exported ? 'Exported' : 'Export essay'}</span>
          </button>
        </div>
      </div>
    </header>
    <dialog ref={dialog} aria-labelledby="guide-title" className="m-auto w-[min(440px,calc(100%-2rem))] rounded-xl border border-slate-200 text-slate-800 shadow-xl backdrop:bg-slate-900/30" onClick={e => { if (e.target === dialog.current) dialog.current?.close() }}>
      <div className="flex min-h-[52px] items-center justify-between gap-3 border-b border-slate-200 px-3 py-2 sm:px-5"><h2 id="guide-title" className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight"><BookOpenText className="text-cobalt" size={18} />Quick guide</h2><IconButton icon={X} label="Close guide" onClick={() => dialog.current?.close()}/></div>
      <div className="space-y-3 p-5 leading-relaxed">
        <p>Write directly on the page. Your title and essay are saved in this browser as you type.</p>
        <p>Double-click a word, select it with the keyboard, or press and hold on a touch screen. The word explorer shows its sentence and suggested alternatives.</p>
        <p>Choose a suggestion to replace that occurrence. Use Undo to return to the previous wording.</p>
        <p className="text-sm text-slate-600">{usesSampleData ? 'The sample thesaurus uses hand-picked word pairs. Higher percentages indicate a stronger association in the sample data. Try “important,” “help,” or “show” in the opening paragraph.' : 'Selecting a word sends the word and its sentence to the thesaurus service. Higher percentages indicate stronger word association.'}</p>
      </div>
    </dialog>
  </>
}
