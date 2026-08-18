import { listLinks } from '@/features/links/linkRepository'
import type { LinkItem } from '@/features/links/types'
import { contentRegistry } from './contentRegistry'
import type { UnifiedContentItem } from '@/types/content'
import type { RouteRecordRaw } from 'vue-router'

export interface ContentProvider {
  id: string
  load: () => Promise<UnifiedContentItem[]>
}

function toolContent(): UnifiedContentItem[] {
  return contentRegistry.map(({ loader: _loader, ...item }) => ({
    ...item,
    source: 'builtin',
    target: item.route,
    external: false,
  }))
}

const builtinToolProvider: ContentProvider = {
  id: 'builtin-tools',
  load: async () => toolContent(),
}

const userLinkProvider: ContentProvider = {
  id: 'user-links',
  load: async () => (await listLinks()).map(linkContent),
}

const contentProviders: ContentProvider[] = [builtinToolProvider, userLinkProvider]

function linkContent(link: LinkItem): UnifiedContentItem {
  return {
    id: link.id,
    type: 'link',
    source: 'user',
    title: link.title,
    description: link.description,
    category: link.category,
    tags: link.tags,
    keywords: [link.url, new URL(link.url).hostname],
    route: link.url,
    icon: 'ExternalLink',
    target: link.url,
    external: true,
  }
}

export interface ContentQuery {
  query?: string
  type?: 'all' | 'tool' | 'link'
  limit?: number
}

export async function listContent(): Promise<UnifiedContentItem[]> {
  return (await Promise.all(contentProviders.map((provider) => provider.load()))).flat()
}

export async function searchUnifiedContent(options: ContentQuery = {}): Promise<UnifiedContentItem[]> {
  const query = options.query?.trim().toLocaleLowerCase() ?? ''
  const items = await listContent()
  const filtered = items.filter((item) => {
    if (options.type && options.type !== 'all' && item.type !== options.type) return false
    if (!query) return true
    return [item.title, item.description, item.category, ...item.tags, ...item.keywords]
      .join(' ')
      .toLocaleLowerCase()
      .includes(query)
  })
  return options.limit ? filtered.slice(0, options.limit) : filtered
}

export function getToolRouteRecords(): RouteRecordRaw[] {
  return contentRegistry.map((tool) => ({
    path: tool.route,
    name: `tool-${tool.id}`,
    component: tool.loader,
    meta: { navigation: 'tools' },
  }))
}
