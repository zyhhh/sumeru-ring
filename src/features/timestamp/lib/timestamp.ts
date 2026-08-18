export function parseTimestamp(value: string): Date {
  const text = value.trim()
  if (!text) throw new Error('请输入时间戳或日期')
  if (/^-?\d+$/.test(text)) {
    const number = Number(text)
    const milliseconds = text.replace('-', '').length <= 10 ? number * 1000 : number
    const date = new Date(milliseconds)
    if (!Number.isNaN(date.getTime())) return date
  }
  const date = new Date(text)
  if (Number.isNaN(date.getTime())) throw new Error('无法识别该时间')
  return date
}

export function describeTime(date: Date) {
  return { seconds: Math.floor(date.getTime() / 1000), milliseconds: date.getTime(), iso: date.toISOString(), local: date.toLocaleString() }
}
