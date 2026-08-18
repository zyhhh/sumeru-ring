const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })

export function encodeBase64(value: string): string {
  const bytes = encoder.encode(value)
  let binary = ''
  bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
  return btoa(binary)
}

export function decodeBase64(value: string): string {
  try {
    const binary = atob(value.trim())
    return decoder.decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)))
  } catch { throw new Error('请输入合法的 Base64 文本') }
}
