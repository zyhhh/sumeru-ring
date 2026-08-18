import { describe, expect, it } from 'vitest'
import { hashText } from './hash'
describe('hash', () => {
  it('calculates md5', () => expect(hashText('abc', 'md5')).toBe('900150983cd24fb0d6963f7d28e17f72'))
  it('calculates sha256', () => expect(hashText('abc', 'sha256')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'))
  it('calculates hmac', () => expect(hashText('abc', 'sha256', 'key')).toHaveLength(64))
})
