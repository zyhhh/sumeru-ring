import {describe,expect,it} from 'vitest';import {decodeUrl,encodeUrl} from './urlCodec'
describe('URL 编解码',()=>{it('完整 URL 保留结构字符',()=>expect(encodeUrl('https://例子.com/a b?q=中文','uri')).toContain('https://'));it('组件模式编码斜杠',()=>expect(encodeUrl('a/b','component')).toBe('a%2Fb'));it('可以还原中文',()=>expect(decodeUrl('%E4%B8%AD%E6%96%87','component')).toBe('中文'))})

