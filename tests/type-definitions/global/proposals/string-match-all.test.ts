import 'core-js/es';
import matchAll from 'core-js/es/string/match-all';

const s = 'abcabc';
const re = /abc/g;

const matchIterNS: RegExpStringIterator<RegExpExecArray> = matchAll(s, re);
const matchIter: RegExpStringIterator<RegExpExecArray> = s.matchAll(re);

// @ts-expect-error
matchAll(s);
// @ts-expect-error
s.matchAll();
// @ts-expect-error
s.matchAll('abc');
// @ts-expect-error
const n: number = s.matchAll(re);
// @ts-expect-error
s.matchAll({});
// @ts-expect-error
s.matchAll(123);
// @ts-expect-error
s.matchAll(/abc/g, /def/g);
