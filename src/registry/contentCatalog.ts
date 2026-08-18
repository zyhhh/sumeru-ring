import { listLinks } from '@/features/links/linkRepository'
import type { LinkItem } from '@/features/links/types'
import { contentRegistry } from './contentRegistry'
import type { ContentType, UnifiedContentItem } from '@/types/content'
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

export const builtinContentTypes: UnifiedContentItem[] = [
  { id: 'command-templates', type: 'command-template', source: 'builtin', title: '命令模板', description: '通过表单生成 Maven、Docker、Git 与 curl 命令', category: '开发辅助', tags: ['命令', '表单生成'], keywords: ['maven', 'docker', 'git', 'curl'], route: '/commands', icon: 'TerminalSquare', target: '/commands', external: false },
  { id: 'code-snippets', type: 'snippet', source: 'user', title: '代码片段', description: '保存常用 SQL、Shell、Docker 与 Nginx 配置', category: '开发辅助', tags: ['代码', '本地保存'], keywords: ['sql', 'shell', 'docker', 'nginx'], route: '/snippets', icon: 'FileCode2', target: '/snippets', external: false },
  { id: 'cheatsheets', type: 'cheatsheet', source: 'builtin', title: '速查表', description: '快速查阅 HTTP 状态码、Linux、正则与 Git 命令', category: '开发辅助', tags: ['参考', '速查'], keywords: ['http', 'linux', 'regex', 'git'], route: '/cheatsheets', icon: 'BookOpenCheck', target: '/cheatsheets', external: false },
]

const contentProviders: ContentProvider[] = [builtinToolProvider, { id: 'builtin-content-types', load: async () => builtinContentTypes }, userLinkProvider]

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
  type?: 'all' | ContentType
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
