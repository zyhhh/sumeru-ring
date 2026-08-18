export const SNIPPET_LANGUAGES = ['SQL', 'Shell', 'Docker', 'Nginx'] as const
export type SnippetLanguage = (typeof SNIPPET_LANGUAGES)[number]

export interface Snippet {
  id: string
  title: string
  language: SnippetLanguage
  code: string
  description: string
  updatedAt: string
}

export type SnippetDraft = Pick<Snippet, 'title' | 'language' | 'code' | 'description'>
const STORAGE_KEY = 'sumeru-ring:snippets'

export function listSnippets(): Snippet[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]') as Snippet[]
  } catch {
    return []
  }
}

export function saveSnippet(draft: SnippetDraft, existing?: Snippet): Snippet {
  const items = listSnippets()
  const item = { ...draft, id: existing?.id ?? crypto.randomUUID(), updatedAt: new Date().toISOString() }
  const index = items.findIndex(({ id }) => id === item.id)
  if (index >= 0) items[index] = item
  else items.unshift(item)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  return item
}

export function deleteSnippet(id: string): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(listSnippets().filter((item) => item.id !== id)))
}
