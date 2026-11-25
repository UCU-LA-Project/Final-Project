import { useEffect, useReducer, useState } from 'react'
import { loadDraft, saveDraft, type Draft } from './draft'

interface History {
  past: Draft[]
  current: Draft
  future: Draft[]
}

type Edit = { type: 'commit'; draft: Draft } | { type: 'undo' | 'redo' }

function reduceHistory(state: History, edit: Edit): History {
  const { current, past, future } = state
  switch (edit.type) {
    case 'commit':
      return { past: [...past.slice(-149), current], current: edit.draft, future: [] }
    case 'undo': {
      const previous = past.at(-1)
      return previous ? { past: past.slice(0, -1), current: previous, future: [...future, current] } : state
    }
    case 'redo': {
      const next = future.at(-1)
      return next ? { past: [...past, current], current: next, future: future.slice(0, -1) } : state
    }
  }
}

export function useDraft() {
  const [history, dispatch] = useReducer(reduceHistory, undefined, () => ({
    past: [], current: loadDraft(), future: [],
  }))
  const [saveState, setSaveState] = useState('Saved locally')

  useEffect(() => {
    try {
      saveDraft(history.current)
      setSaveState('Saved locally')
    } catch {
      setSaveState('Local save unavailable')
    }
  }, [history.current])

  return {
    draft: history.current, saveState, dispatch,
    canUndo: history.past.length > 0, canRedo: history.future.length > 0,
  }
}
