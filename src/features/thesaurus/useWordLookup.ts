import { useEffect, useState } from 'react'
import { lookupWord, type WordEntry, type WordLookupRequest } from './thesaurus'

type LookupResult =
  | { status: 'loading' | 'error'; entry: null }
  | { status: 'ready'; entry: WordEntry | null }

// Each selected occurrence mounts its own explorer. Start the feedback immediately,
// debounce the request, and discard its result when the selection goes away.
export function useWordLookup({ term, sentence, start, end }: WordLookupRequest) {
  const [result, setResult] = useState<LookupResult>({ status: 'loading', entry: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      try {
        const entry = await lookupWord({ term, sentence, start, end }, controller.signal)
        if (!controller.signal.aborted) setResult({ status: 'ready', entry })
      } catch {
        if (!controller.signal.aborted) setResult({ status: 'error', entry: null })
      }
    }, 260)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [term, sentence, start, end, attempt])

  function retry() {
    setResult({ status: 'loading', entry: null })
    setAttempt(value => value + 1)
  }

  return { result, retry }
}
