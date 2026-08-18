import { describe, expect, it } from 'vitest'
import { describeTime, parseTimestamp } from './timestamp'
describe('timestamp', () => {
  it('parses second timestamps', () => expect(parseTimestamp('0').toISOString()).toBe('1970-01-01T00:00:00.000Z'))
  it('parses millisecond timestamps', () => expect(parseTimestamp('1704067200000').toISOString()).toBe('2024-01-01T00:00:00.000Z'))
  it('describes a date', () => expect(describeTime(new Date(1000)).seconds).toBe(1))
})
