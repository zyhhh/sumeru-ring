import type { ToolDefinition } from '@/types/content'

// 注册表是首页、搜索和导航的唯一数据源。新增工具时只需增加一项，避免多处同步修改。
export const contentRegistry: ToolDefinition[] = [
  { id: 'jwt', type: 'tool', source: 'builtin', title: 'JWT 解析', description: '解析令牌内容并验证 HMAC 签名', category: '安全与认证', tags: ['JWT', '认证'], keywords: ['token', 'hs256', 'payload'], route: '/tools/jwt', icon: 'KeyRound', loader: () => import('@/features/jwt/views/JwtToolView.vue') },
  { id: 'qr-code', type: 'tool', source: 'builtin', title: '二维码生成与识别', description: '生成个性二维码或识别本地图片', category: '编码转换', tags: ['二维码', '图片'], keywords: ['qrcode', 'wifi', 'logo'], route: '/tools/qr-code', icon: 'QrCode', loader: () => import('@/features/qr-code/views/QrCodeToolView.vue') },
  { id: 'json', type: 'tool', source: 'builtin', title: 'JSON 工具', description: '格式化、转义、去转义与压缩 JSON', category: '开发辅助', tags: ['JSON', '格式化'], keywords: ['escape', 'pretty', '压缩'], route: '/tools/json', icon: 'Braces', loader: () => import('@/features/json/views/JsonToolView.vue') },
  { id: 'url-codec', type: 'tool', source: 'builtin', title: 'URL 编解码', description: '编码或还原 URL 与查询参数', category: '编码转换', tags: ['URL', '编码'], keywords: ['encodeURI', 'decodeURI', 'component'], route: '/tools/url-codec', icon: 'Link', loader: () => import('@/features/url-codec/views/UrlCodecToolView.vue') },
  { id: 'character-count', type: 'tool', source: 'builtin', title: '字符数统计', description: '分类统计字符并计算加权总数', category: '文本处理', tags: ['字符', '统计'], keywords: ['汉字', '标点', '长度'], route: '/tools/character-count', icon: 'TextCursorInput', loader: () => import('@/features/character-count/views/CharacterCountToolView.vue') },
  { id: 'text-diff', type: 'tool', source: 'builtin', title: '文本比较', description: '以 Git 风格查看两段文本的行级和行内差异', category: '文本处理', tags: ['文本', 'Diff'], keywords: ['比较', '差异', 'diff', 'git'], route: '/tools/text-diff', icon: 'FileDiff', loader: () => import('@/features/text-diff/views/TextDiffToolView.vue') },
]

export function searchContent(query: string): ToolDefinition[] {
  const normalized = query.trim().toLocaleLowerCase()
  if (!normalized) return contentRegistry

  return contentRegistry.filter((item) =>
    [item.title, item.description, item.category, ...item.tags, ...item.keywords]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalized),
  )
}
