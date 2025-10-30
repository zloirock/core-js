import 'core-js/full';
import '@core-js/types';

const s = 'abcabc';
const re = /abc/g;
const matchIter: RegExpStringIterator<RegExpExecArray> = s.matchAll(re);

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
