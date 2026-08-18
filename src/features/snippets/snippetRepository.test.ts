import { beforeEach, describe, expect, it } from 'vitest'
import { deleteSnippet, listSnippets, saveSnippet } from './snippetRepository'

describe('snippet repository', () => {
  beforeEach(() => localStorage.clear())

  it('saves, updates and deletes snippets', () => {
    const item = saveSnippet({ title: '查用户', language: 'SQL', code: 'select * from users', description: '' })
    saveSnippet({ ...item, title: '查询用户' }, item)
    expect(listSnippets()[0]?.title).toBe('查询用户')
    deleteSnippet(item.id)
    expect(listSnippets()).toEqual([])
  })
})
