import { decodeJwt, decodeProtectedHeader, jwtVerify, type JWSAlgorithm } from 'jose'

const HMAC_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const satisfies readonly JWSAlgorithm[]
type HmacAlgorithm = (typeof HMAC_ALGORITHMS)[number]

export function parseJwt(token:string){return {header:decodeProtectedHeader(token),payload:decodeJwt(token),signature:token.split('.')[2]??''}}
export async function verifyHmacJwt(token: string, secret: string) {
  const header = decodeProtectedHeader(token)
  const algorithm = header.alg

  if (!algorithm || !HMAC_ALGORITHMS.includes(algorithm as HmacAlgorithm)) {
    throw new Error(`当前只支持 HMAC 算法，令牌使用的是 ${algorithm ?? '未声明算法'}`)
  }

  return jwtVerify(token, new TextEncoder().encode(secret), {
    algorithms: [algorithm as HmacAlgorithm],
  })
}
export function describeTimestamp(value:unknown){if(typeof value!=='number')return null;const date=new Date(value*1000);return {raw:value,local:date.toLocaleString(),iso:date.toISOString()}}
