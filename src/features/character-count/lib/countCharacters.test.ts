import {describe, expect, it} from 'vitest';
import {countCharacters} from './countCharacters'

describe('字符统计', () => {
    it('按规则分类并加权', () => {
        const value = countCharacters('中，A!1 \n\t🙂');
        expect(value).toMatchObject({
            han: 1,
            chinesePunctuation: 1,
            letters: 1,
            englishPunctuation: 1,
            digits: 1,
            spaces: 1,
            newlines: 1,
            tabs: 1,
            other: 1,
            raw: 9,
            weighted: 11
        })
    });
    it('Emoji 按一个 Unicode 字符统计', () => expect(countCharacters('🙂').raw).toBe(1))
})

