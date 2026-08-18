import {describe, expect, it} from 'vitest'
import {compactRows, compareText} from './textDiff'

describe('compareText', () => {
    it('相同文本没有差异', () => {
        const result = compareText('one\ntwo', 'one\ntwo');
        expect(result.stats.total).toBe(0);
        expect(result.rows).toHaveLength(2)
    })
    it('统计新增与删除行', () => {
        const result = compareText('one\ntwo', 'one\nthree\nfour');
        expect(result.stats).toEqual({added: 2, removed: 1, modified: 1, total: 1})
    })
    it('标记修改行内的具体片段', () => {
        const row = compareText('hello old world', 'hello new world').rows[0];
        expect(row?.left?.segments.some(item => item.kind === 'removed' && item.text === 'old')).toBe(true);
        expect(row?.right?.segments.some(item => item.kind === 'added' && item.text === 'new')).toBe(true)
    })
    it('支持空文本', () => {
        expect(compareText('', '').stats.total).toBe(0);
        expect(compareText('', 'new').stats.added).toBe(1)
    })
    it('可以忽略空白差异', () => {
        expect(compareText('a  b', 'a b', true).stats.total).toBe(0);
        expect(compareText('a  b', 'a b', false).stats.total).toBe(1)
    })
    it('连续差异按块导航', () => {
        expect(compareText('a\nb\nc\nd', 'a\nx\nc\ny').differenceIds).toHaveLength(2)
    })
    it('只看差异时保留前后上下文并折叠其他行', () => {
        const result = compareText('1\n2\n3\n4\n5\n6\n7\n8\n9', '1\n2\n3\n4\nX\n6\n7\n8\n9');
        const items = compactRows(result.rows, 1);
        expect(items.filter(item => item.type === 'gap').map(item => item.count)).toEqual([3, 3])
    })
    it('相邻差异的上下文会自动合并', () => {
        const result = compareText('1\n2\n3\n4\n5', '1\nX\n3\nY\n5');
        expect(compactRows(result.rows, 1).every(item => item.type === 'row')).toBe(true)
    })
})
