import { describe, expect, it } from 'vitest'
import { generateSnowflake, generateUuid, generateUuidV4, generateUuidV7, toggleUuidHyphens, TWITTER_SNOWFLAKE_EPOCH } from './idGenerator'
describe('id generator', () => {
  it('generates uuid v4', () => expect(generateUuid()).toMatch(/^[0-9a-f-]{36}$/))
  it('generates standard v4 format', () => expect(generateUuidV4()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/))
  it('generates uuid v7 with the expected version and variant', () => expect(generateUuidV7()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/))
  it('removes and restores UUID hyphens', () => {
    const uuid = '01890f3a-2b7c-7abc-8def-0123456789ab'
    const compact = toggleUuidHyphens(uuid)
    expect(compact).toBe('01890f3a2b7c7abc8def0123456789ab')
    expect(toggleUuidHyphens(compact)).toBe(uuid)
  })
  it('generates deterministic snowflakes', () => expect(generateSnowflake(1, 1, 2, 1577836800001)).toBe('4329474'))
  it('supports a custom snowflake epoch', () => expect(generateSnowflake(1, 1, 2, TWITTER_SNOWFLAKE_EPOCH + 1, TWITTER_SNOWFLAKE_EPOCH)).toBe('4329474'))
  it('rejects an epoch later than the generation time', () => expect(() => generateSnowflake(1, 1, 0, 1000, 1001)).toThrow('不能晚于'))
  it('validates data center id', () => expect(() => generateSnowflake(32, 1, 0)).toThrow('数据中心 ID'))
  it('validates worker id', () => expect(() => generateSnowflake(1, 32, 0)).toThrow('机器 ID'))
})
