export type ContentType = 'tool' | 'link'

export type ContentSource = 'builtin' | 'user'

export interface ContentItem {
  id: string
  type: ContentType
  title: string
  description: string
  category: string
  tags: string[]
  keywords: string[]
  route: string
  icon: string
}

import type { Component } from 'vue'

export interface ToolDefinition extends Omit<ContentItem, 'type'> {
  type: 'tool'
  source: 'builtin'
  loader: () => Promise<{ default: Component }>
}

export interface UnifiedContentItem extends Omit<ContentItem, 'type'> {
  type: ContentType
  source: ContentSource
  target: string
  external: boolean
}
