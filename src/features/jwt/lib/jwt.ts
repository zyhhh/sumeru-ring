import {decodeJwt, decodeProtectedHeader, errors, jwtVerify, type JWSAlgorithm} from 'jose'

const HMAC_ALGORITHMS = ['HS256', 'HS384', 'HS512'] as const satisfies readonly JWSAlgorithm[]
type HmacAlgorithm = (typeof HMAC_ALGORITHMS)[number]
const HMAC_HASHES: Record<HmacAlgorithm, string> = {HS256: 'SHA-256', HS384: 'SHA-384', HS512: 'SHA-512'}

function importHmacKey(bytes: Uint8Array, algorithm: HmacAlgorithm) {
    return crypto.subtle.importKey('raw', bytes, {name: 'HMAC', hash: HMAC_HASHES[algorithm]}, false, ['verify'])
}

export function parseJwt(token: string) {
    try {
        return {header: decodeProtectedHeader(token), payload: decodeJwt(token), signature: token.split('.')[2] ?? ''}
    } catch {
        throw new Error('令牌格式不正确，请确认内容完整且包含由英文句点分隔的三个部分')
    }
}

export async function verifyHmacJwt(token: string, secret: string) {
    let header: ReturnType<typeof decodeProtectedHeader>
    try {
        header = decodeProtectedHeader(token)
    } catch {
        throw new Error('令牌格式不正确，请确认内容完整且包含由英文句点分隔的三个部分')
    }
    const algorithm = header.alg

    if (!algorithm || !HMAC_ALGORITHMS.includes(algorithm as HmacAlgorithm)) {
        throw new Error(`当前只支持 HMAC 算法，令牌使用的是 ${algorithm ?? '未声明算法'}`)
    }

    const options = {algorithms: [algorithm as HmacAlgorithm]}
    try {
        const key = await importHmacKey(new TextEncoder().encode(secret), algorithm as HmacAlgorithm)
        const result = await jwtVerify(token, key, options)
        return {...result, keyEncoding: 'UTF-8' as const}
    } catch (error) {
        if (error instanceof errors.JWTExpired) throw new Error('令牌已过期，无法通过签名验证')
        if (error instanceof errors.JWTClaimValidationFailed) throw new Error('令牌尚未生效或声明内容不符合要求')
        if (!(error instanceof errors.JWSSignatureVerificationFailed)) throw new Error('签名验证失败，请检查令牌格式、签名算法和密钥')
    }

    try {
        const normalized = secret.replace(/-/g, '+').replace(/_/g, '/')
        const decoded = Uint8Array.from(atob(normalized), character => character.charCodeAt(0))
        const key = await importHmacKey(decoded, algorithm as HmacAlgorithm)
        const result = await jwtVerify(token, key, options)
        return {...result, keyEncoding: 'Base64' as const}
    } catch (error) {
        if (error instanceof errors.JWSSignatureVerificationFailed) {
            throw new Error('签名验证失败：UTF-8 和 Base64 两种密钥编码均不匹配')
        }
        if (error instanceof errors.JWTExpired) throw new Error('令牌已过期，无法通过签名验证')
        if (error instanceof errors.JWTClaimValidationFailed) throw new Error('令牌尚未生效或声明内容不符合要求')
        throw new Error('签名验证失败，请检查令牌格式、签名算法和密钥')
    }
}

export function describeTimestamp(value: unknown) {
    if (typeof value !== 'number') return null;
    const date = new Date(value * 1000);
    return {raw: value, local: date.toLocaleString(), iso: date.toISOString()}
}
