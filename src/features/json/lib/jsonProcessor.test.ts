import {describe, expect, it} from 'vitest'
import {processJson} from './jsonProcessor'

describe('JSON 处理', () => {
    it('格式化 JSON', () => {
        expect(processJson('{"a":1}', 'format').value).toContain('\n')
    })

    it('压缩 JSON', () => {
        expect(processJson('{ "a": 1 }', 'minify').value).toBe('{"a":1}')
    })

    it('转义与去转义可以往返', () => {
        const input = 'line 1\n"line 2"'
        const escaped = processJson(input, 'escape').value

        expect(processJson(escaped, 'unescape').value).toBe(input)
    })

    it('可以还原反斜杠和制表符', () => {
        const input = 'C:\\temp\tfile.json'
        const escaped = processJson(input, 'escape').value

        expect(processJson(escaped, 'unescape').value).toBe(input)
    })
})
