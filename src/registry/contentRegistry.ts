import type { ToolDefinition } from '@/types/content'

// 注册表是首页、搜索和导航的唯一数据源。新增工具时只需增加一项，避免多处同步修改。
export const contentRegistry: ToolDefinition[] = [
  { id: 'jwt', type: 'tool', source: 'builtin', title: 'JWT 解析', description: '解析令牌内容并验证 HMAC 签名', category: '安全与认证', tags: ['JWT', '认证'], keywords: ['token', 'hs256', 'payload'], route: '/tools/jwt', icon: 'KeyRound', loader: () => import('@/features/jwt/views/JwtToolView.vue') },
  { id: 'qr-code', type: 'tool', source: 'builtin', title: '二维码生成与识别', description: '生成个性二维码或识别本地图片', category: '编码转换', tags: ['二维码', '图片'], keywords: ['qrcode', 'wifi', 'logo'], route: '/tools/qr-code', icon: 'QrCode', loader: () => import('@/features/qr-code/views/QrCodeToolView.vue') },
  { id: 'json', type: 'tool', source: 'builtin', title: 'JSON 工具', description: '格式化、转义、去转义与压缩 JSON', category: '开发辅助', tags: ['JSON', '格式化'], keywords: ['escape', 'pretty', '压缩'], route: '/tools/json', icon: 'Braces', loader: () => import('@/features/json/views/JsonToolView.vue') },
  { id: 'url-codec', type: 'tool', source: 'builtin', title: 'URL 编解码', description: '编码或还原 URL 与查询参数', category: '编码转换', tags: ['URL', '编码'], keywords: ['encodeURI', 'decodeURI', 'component'], route: '/tools/url-codec', icon: 'Link', loader: () => import('@/features/url-codec/views/UrlCodecToolView.vue') },
  { id: 'character-count', type: 'tool', source: 'builtin', title: '字符数统计', description: '分类统计字符并计算加权总数', category: '文本处理', tags: ['字符', '统计'], keywords: ['汉字', '标点', '长度'], route: '/tools/character-count', icon: 'TextCursorInput', loader: () => import('@/features/character-count/views/CharacterCountToolView.vue') },
  { id: 'text-diff', type: 'tool', source: 'builtin', title: '文本比较', description: '以 Git 风格查看两段文本的行级和行内差异', category: '文本处理', tags: ['文本', 'Diff'], keywords: ['比较', '差异', 'diff', 'git'], route: '/tools/text-diff', icon: 'FileDiff', loader: () => import('@/features/text-diff/views/TextDiffToolView.vue') },
  { id: 'timestamp', type: 'tool', source: 'builtin', title: '时间戳转换', description: '转换秒、毫秒、ISO 与本地时间', category: '日期时间', tags: ['时间戳', '时区'], keywords: ['timestamp', 'unix', 'iso'], route: '/tools/timestamp', icon: 'Clock3', loader: () => import('@/features/timestamp/views/TimestampToolView.vue') },
  { id: 'base64', type: 'tool', source: 'builtin', title: 'Base64 编解码', description: '在 UTF-8 文本与 Base64 之间转换', category: '编码转换', tags: ['Base64', 'UTF-8'], keywords: ['encode', 'decode', '编码'], route: '/tools/base64', icon: 'Binary', loader: () => import('@/features/base64/views/Base64ToolView.vue') },
  { id: 'id-generator', type: 'tool', source: 'builtin', title: 'UUID / 雪花 ID 生成器', description: '批量生成 UUID v4 或雪花 ID', category: '开发辅助', tags: ['UUID', 'Snowflake'], keywords: ['id', '唯一标识', '雪花'], route: '/tools/id-generator', icon: 'Fingerprint', loader: () => import('@/features/id-generator/views/IdGeneratorToolView.vue') },
  { id: 'hash', type: 'tool', source: 'builtin', title: 'Hash / HMAC 计算', description: '计算 MD5、SHA 与 HMAC 摘要', category: '安全与认证', tags: ['Hash', 'HMAC'], keywords: ['md5', 'sha1', 'sha256', 'sha512'], route: '/tools/hash', icon: 'Hash', loader: () => import('@/features/hash/views/HashToolView.vue') },
  { id: 'cron', type: 'tool', source: 'builtin', title: 'Cron 表达式解析', description: '校验表达式并预览未来执行时间', category: '日期时间', tags: ['Cron', '定时任务'], keywords: ['schedule', 'xxl-job', '定时'], route: '/tools/cron', icon: 'CalendarClock', loader: () => import('@/features/cron/views/CronToolView.vue') },
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
