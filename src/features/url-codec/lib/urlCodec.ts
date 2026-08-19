export type UrlMode = 'uri' | 'component'
export function encodeUrl(value: string, mode: UrlMode): string { return mode === 'uri' ? encodeURI(value) : encodeURIComponent(value) }
export function decodeUrl(value: string, mode: UrlMode): string {
  try { return mode === 'uri' ? decodeURI(value) : decodeURIComponent(value) }
  catch { throw new Error('内容包含不完整或无效的百分号编码') }
}
