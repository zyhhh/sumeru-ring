export type JsonAction = 'format' | 'minify' | 'escape' | 'unescape'

export interface JsonResult {
  value: string
  size: number
}

export function processJson(input: string, action: JsonAction): JsonResult {
  let value = ''

  if (action === 'format') {
    value = JSON.stringify(JSON.parse(input), null, 2)
  } else if (action === 'minify') {
    value = JSON.stringify(JSON.parse(input))
  } else if (action === 'escape') {
    // JSON.stringify 会正确处理引号、反斜杠、换行等字符；这里只去掉最外层引号。
    value = JSON.stringify(input).slice(1, -1)
  } else {
    // 输入就是 JSON 字符串内部的转义内容，直接补回外层引号即可解析。
    // 不能再次替换双引号，否则会破坏已经存在的 \" 转义序列。
    value = JSON.parse(`"${input}"`)
  }

  return { value, size: new Blob([value]).size }
}
