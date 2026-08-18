import { describe, expect, it } from 'vitest'
import { describeCron, nextCronRuns } from './cron'
describe('cron', () => {
  it('lists future runs', () => expect(nextCronRuns('*/5 * * * *', 2, new Date('2026-01-01T00:00:00Z'))).toEqual(['2026-01-01T00:05:00.000Z', '2026-01-01T00:10:00.000Z']))
  it('describes presets', () => expect(describeCron('0 0 * * *')).toBe('每天 00:00 执行'))
  it('rejects invalid expressions', () => expect(() => nextCronRuns('invalid')).toThrow('无效'))
})
