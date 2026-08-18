import { bytesToHex, utf8ToBytes } from '@noble/hashes/utils.js'
import { md5, sha1 } from '@noble/hashes/legacy.js'
import { sha256, sha512 } from '@noble/hashes/sha2.js'
import { hmac } from '@noble/hashes/hmac.js'

export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'
const algorithms = { md5, sha1, sha256, sha512 }
export function hashText(value: string, algorithm: HashAlgorithm, key?: string): string {
  const fn = algorithms[algorithm]
  const bytes = key ? hmac(fn, utf8ToBytes(key), utf8ToBytes(value)) : fn(utf8ToBytes(value))
  return bytesToHex(bytes)
}
