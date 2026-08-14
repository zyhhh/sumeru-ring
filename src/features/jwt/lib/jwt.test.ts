import { describe, expect, it } from 'vitest'
import { verifyHmacJwt } from './jwt'

const token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxY2U5ODdjNy1mY2RjLTQ1NTMtYmJkOC0yOWZmZmVkNjFhY2IiLCJ0b2tlbktpbmQiOiIwIiwidG9rZW5UeXBlIjoiMSIsImV4cCI6MTc4NzI3MzUyMiwiaWF0IjoxNzg2NjczNTIyfQ.ql-IgvotmNrXbEN_kOZ3LrlWFK4xRmufJfMbcp0QRtc'

describe('verifyHmacJwt', () => {
  it('兼容旧版 JJWT 使用 Base64 字符串密钥签名的令牌', async () => {
    const result = await verifyHmacJwt(token, 'mySecret')
    expect(result.keyEncoding).toBe('Base64')
  })

  it('密钥不匹配时给出明确错误', async () => {
    await expect(verifyHmacJwt(token, 'wrongSecret')).rejects.toThrow('两种密钥编码均不匹配')
  })
})
