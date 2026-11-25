interface SampleGroup {
  part: string
  entries: [name: string, gloss: string][]
  sampleAssociations: [first: string, second: string, score: number][]
}

export interface WordEntry {
  part: string
  alternatives: { name: string; gloss: string; score: number }[]
}

export interface WordLookupRequest {
  term: string
  sentence: string
  start: number
  end: number
}

const endpoint = import.meta.env.VITE_ALTERNATIVES_API_URL?.trim()
export const usesSampleData = !endpoint

export async function lookupWord(request: WordLookupRequest, signal: AbortSignal): Promise<WordEntry | null> {
  if (endpoint) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(request),
      signal,
    })
    if (!response.ok) throw new Error('The word lookup failed.')
    return response.json()
  }

  const response = await fetch(import.meta.env.BASE_URL + 'data/thesaurus.json', { signal })
  if (!response.ok) throw new Error('The thesaurus could not be loaded.')
  const groups: SampleGroup[] = await response.json()
  const key = request.term.toLowerCase()
  const group = groups.find(({ entries }) => entries.some(([name]) => name === key))
  if (!group) return null
  const glosses = new Map(group.entries)
  const alternatives = group.sampleAssociations
    .filter(([a, b]) => a === key || b === key)
    .map(([a, b, score]) => {
      const name = a === key ? b : a
      const gloss = glosses.get(name)
      if (gloss === undefined) throw new Error('Missing definition for ' + name)
      return { name, gloss, score }
    })
    .sort((a, b) => b.score - a.score)
  return { part: group.part, alternatives }
}
