export interface CharacterStatistics {
    han: number;
    chinesePunctuation: number;
    letters: number;
    englishPunctuation: number;
    digits: number;
    spaces: number;
    newlines: number;
    tabs: number;
    other: number;
    raw: number;
    weighted: number
}

const HAN = /\p{Script=Han}/u;
const LETTER = /[A-Za-z]/;
const DIGIT = /[0-9]/;
const CN_PUNCT = /[，。！？、；：“”‘’（）【】《》〈〉…—·]/;
const EN_PUNCT = /[!"#$%&'()*+,\-./:;<=>?@[\]\\^_`{|}~]/

export function countCharacters(value: string): CharacterStatistics {
    const s: CharacterStatistics = {
        han: 0,
        chinesePunctuation: 0,
        letters: 0,
        englishPunctuation: 0,
        digits: 0,
        spaces: 0,
        newlines: 0,
        tabs: 0,
        other: 0,
        raw: 0,
        weighted: 0
    };
    for (const char of value) {
        s.raw++;
        if (HAN.test(char)) s.han++; else if (CN_PUNCT.test(char)) s.chinesePunctuation++; else if (LETTER.test(char)) s.letters++; else if (DIGIT.test(char)) s.digits++; else if (char === ' ') s.spaces++; else if (char === '\n' || char === '\r') s.newlines++; else if (char === '\t') s.tabs++; else if (EN_PUNCT.test(char)) s.englishPunctuation++; else s.other++
    }
    s.weighted = s.han * 2 + s.chinesePunctuation * 2 + s.letters + s.englishPunctuation + s.digits + s.spaces + s.newlines + s.tabs + s.other;
    return s
}

