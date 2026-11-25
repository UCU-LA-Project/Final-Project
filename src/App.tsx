import { AppHeader } from './components/AppHeader'
import BookDrawing from './components/BookDrawing'
import { downloadDraft } from './features/editor/draft'
import { EssayEditor } from './features/editor/EssayEditor'
import { useDraft } from './features/editor/useDraft'
import { useFullscreen } from './hooks/useFullscreen'

export default function App() {
  const document = useDraft()
  const { workspace, fullscreen, toggle } = useFullscreen()

  return (
    <div>
      <AppHeader fullscreen={fullscreen} onExport={() => downloadDraft(document.draft)} />
      <main className="container pb-2 pt-4 md:pt-6">
        <div ref={workspace} data-fullscreen={fullscreen || undefined}
          className={fullscreen ? 'fixed inset-0 z-10 flex flex-col overflow-auto overscroll-contain bg-gray-50 p-3 [scrollbar-gutter:stable] md:p-6' : undefined}>
          <EssayEditor document={document} fullscreen={fullscreen} toggleFullscreen={toggle} />
        </div>
        <footer className="flex items-center justify-between gap-4 px-1 text-xs text-slate-500">
          <p>Select a word in your essay to see alternatives.</p>
          <BookDrawing />
        </footer>
      </main>
    </div>
  )
}
