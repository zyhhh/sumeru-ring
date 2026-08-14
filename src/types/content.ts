export type ContentType = 'tool' | 'link'

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

