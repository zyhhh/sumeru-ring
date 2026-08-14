export const LINK_CATEGORIES = ['工具', '中转站', '资源', '影视'] as const
export type LinkCategory = (typeof LINK_CATEGORIES)[number]

export interface LinkItem {
  id: string
  title: string
  url: string
  category: LinkCategory
  tags: string[]
  description: string
  order: number
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export type LinkDraft = Pick<LinkItem, 'title' | 'url' | 'category' | 'tags' | 'description'>

