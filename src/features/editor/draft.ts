export interface Draft {
  title: string
  body: string
}

const sample: Draft = {
  title: 'Learning from mistakes',
  body: [
    'Feedback is important when students write their first essay. A teacher can help students see gaps in their reasoning. Concrete examples show how an argument can improve.',
    'The first draft rarely says exactly what we mean. We write a sentence, read it back, and notice the distance between the idea on the page and the one we had in mind.',
    'Revision gives us a chance to close that distance. Sometimes a better word is enough. Other times, a mistake invites us to ask a different question altogether.',
  ].join('\n\n'),
}

const draftKey = 'lexicon.essay.v1'

export function loadDraft(): Draft {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(draftKey) ?? 'null')
    if (saved && typeof saved === 'object' && 'title' in saved && 'body' in saved &&
        typeof saved.title === 'string' && typeof saved.body === 'string') {
      return { title: saved.title, body: saved.body }
    }
  } catch { /* A fresh draft is available when browser storage is inaccessible. */ }
  return sample
}

export function saveDraft(draft: Draft) {
  localStorage.setItem(draftKey, JSON.stringify(draft))
}

export function downloadDraft(draft: Draft) {
  const blob = new Blob([draft.title + '\n\n' + draft.body + '\n'], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = (draft.title.trim().replace(/[^\p{L}\p{N} _-]/gu, '') || 'Essay') + '.txt'
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
