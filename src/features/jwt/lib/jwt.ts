import { decodeJwt, decodeProtectedHeader, errors, jwtVerify, type JWSAlgorithm } from 'jose'

const HMAC_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const satisfies readonly JWSAlgorithm[]
type HmacAlgorithm = (typeof HMAC_ALGORITHMS)[number]
const HMAC_HASHES: Record<HmacAlgorithm, string> = { HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512' }

function importHmacKey(bytes: Uint8Array, algorithm: HmacAlgorithm) {
  return crypto.subtle.importKey('raw', bytes, { name: 'HMAC', hash: HMAC_HASHES[algorithm] }, false, ['verify'])
}

export function parseJwt(token:string){return {header:decodeProtectedHeader(token),payload:decodeJwt(token),signature:token.split('.')[2]??''}}
export async function verifyHmacJwt(token: string, secret: string) {
  const header = decodeProtectedHeader(token)
  const algorithm = header.alg

  if (!algorithm || !HMAC_ALGORITHMS.includes(algorithm as HmacAlgorithm)) {
    throw new Error(`当前只支持 HMAC 算法，令牌使用的是 ${algorithm ?? '未声明算法'}`)
  }

  const options = { algorithms: [algorithm as HmacAlgorithm] }
  try {
    const key = await importHmacKey(new TextEncoder().encode(secret), algorithm as HmacAlgorithm)
    const result = await jwtVerify(token, key, options)
    return { ...result, keyEncoding: 'UTF-8' as const }
  } catch (error) {
    if (!(error instanceof errors.JWSSignatureVerificationFailed)) throw error
  }

  try {
    const normalized = secret.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = Uint8Array.from(atob(normalized), character => character.charCodeAt(0))
    const key = await importHmacKey(decoded, algorithm as HmacAlgorithm)
    const result = await jwtVerify(token, key, options)
    return { ...result, keyEncoding: 'Base64' as const }
  } catch (error) {
    if (error instanceof errors.JWSSignatureVerificationFailed) {
      throw new Error('signature verification failed：UTF-8 和 Base64 两种密钥编码均不匹配')
    }
    throw error
  }
}
export function describeTimestamp(value:unknown){if(typeof value!=='number')return null;const date=new Date(value*1000);return {raw:value,local:date.toLocaleString(),iso:date.toISOString()}}
