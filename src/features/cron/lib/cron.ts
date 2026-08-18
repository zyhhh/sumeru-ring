import { CronExpressionParser } from 'cron-parser'

export function nextCronRuns(expression: string, count = 5, currentDate = new Date()): string[] {
  try {
    const interval = CronExpressionParser.parse(expression.trim(), { currentDate })
    return Array.from({ length: count }, () => {
      const value = interval.next().toISOString()
      if (!value) throw new Error('无法计算下一次执行时间')
      return value
    })
  } catch { throw new Error('Cron 表达式无效，请检查字段数量和取值范围') }
}

export function describeCron(expression: string): string {
  const presets: Record<string, string> = { '* * * * *': '每分钟执行', '0 * * * *': '每小时整点执行', '0 0 * * *': '每天 00:00 执行', '0 0 * * 1': '每周一 00:00 执行' }
  return presets[expression.trim()] ?? '按表达式指定的分钟、小时、日期、月份和星期执行'
}
