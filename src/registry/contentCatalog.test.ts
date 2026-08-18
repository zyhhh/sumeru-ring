import { describe, expect, it, vi } from 'vitest'

vi.mock('@/features/links/linkRepository', () => ({
  listLinks: vi.fn(async () => [{
    id: 'link-1', title: 'Vue', url: 'https://vuejs.org/', category: '工具', tags: ['前端'], description: 'Vue 官网', order: 10, isDefault: true, createdAt: '', updatedAt: '',
  }]),
}))

import { getToolRouteRecords, searchUnifiedContent } from './contentCatalog'

describe('content catalog', () => {
  it('derives tool routes from the tool definitions', () => {
    const routes = getToolRouteRecords()
    expect(routes.map((route) => route.path)).toContain('/tools/jwt')
    expect(routes.find((route) => route.path === '/tools/jwt')?.name).toBe('tool-jwt')
  })

  it('searches builtin tools and user links through one query', async () => {
    const results = await searchUnifiedContent({ query: 'vue' })
    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({ type: 'link', external: true, target: 'https://vuejs.org/' })
  })

  it('filters unified results by content type', async () => {
    const results = await searchUnifiedContent({ type: 'tool' })
    expect(results.every((item) => item.type === 'tool')).toBe(true)
  })

  it('includes the additional content types in unified search', async () => {
    const results = await searchUnifiedContent({ query: 'docker' })
    expect(results.map((item) => item.type)).toEqual(expect.arrayContaining(['command-template', 'snippet']))
  })
})
