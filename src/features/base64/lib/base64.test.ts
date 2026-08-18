import { describe, expect, it } from 'vitest'
import { decodeBase64, encodeBase64 } from './base64'
describe('base64', () => {
  it('round trips unicode', () => expect(decodeBase64(encodeBase64('你好，SUMERU'))).toBe('你好，SUMERU'))
  it('rejects invalid input', () => expect(() => decodeBase64('%%%')).toThrow('合法'))
})
