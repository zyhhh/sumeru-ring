export type UrlMode = 'uri' | 'component'
export function encodeUrl(value: string, mode: UrlMode): string { return mode === 'uri' ? encodeURI(value) : encodeURIComponent(value) }
export function decodeUrl(value: string, mode: UrlMode): string { return mode === 'uri' ? decodeURI(value) : decodeURIComponent(value) }

