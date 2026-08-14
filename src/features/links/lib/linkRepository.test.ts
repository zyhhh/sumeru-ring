import { describe, expect, it } from 'vitest'
import { normalizeHttpUrl } from '../linkRepository'

describe('网址规范化', () => {
  it('自动补全 https 协议', () => expect(normalizeHttpUrl('example.com')).toBe('https://example.com/'))
  it('保留合法的 http 地址', () => expect(normalizeHttpUrl('http://example.com/a')).toBe('http://example.com/a'))
  it('拒绝非 HTTP 协议', () => expect(() => normalizeHttpUrl('javascript:alert(1)')).toThrow())
})

