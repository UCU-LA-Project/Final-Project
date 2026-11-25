export interface WordSelection {
  start: number
  end: number
  term: string
}

const word = /^[\p{L}]+(?:[’'-][\p{L}]+)*$/u
const adjoining = /[\p{L}\p{N}’'-]/u
const sentences = typeof Intl.Segmenter === 'function'
  ? new Intl.Segmenter('en', { granularity: 'sentence' })
  : null
export function getSelection(body: string, from: number, to: number): WordSelection | null {
  const raw = body.slice(from, to)
  const term = raw.trim()
  if (!word.test(term)) return null
  const start = from + raw.indexOf(term)
  const end = start + term.length
  if (adjoining.test(body[start - 1] || '') || adjoining.test(body[end] || '')) return null
  return { start, end, term }
}

export function sentenceParts(body: string, selection: WordSelection) {
  const sentence = sentences?.segment(body).containing(selection.start)
  if (sentence) {
    return {
      before: body.slice(sentence.index, selection.start).trimStart(),
      after: sentence.segment.slice(selection.end - sentence.index).trimEnd(),
    }
  }
  return {
    before: body.slice(0, selection.start).split(/[.!?\n]/).at(-1)?.trimStart() ?? '',
    after: body.slice(selection.end).match(/^[^.!?\n]*[.!?]?/)?.[0] ?? '',
  }
}

export function matchCase(term: string, replacement: string) {
  if (term === term.toUpperCase()) return replacement.toUpperCase()
  if (/^[A-Z]/.test(term)) return replacement[0].toUpperCase() + replacement.slice(1)
  return replacement
}
