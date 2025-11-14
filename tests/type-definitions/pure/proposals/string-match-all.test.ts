import stringMatchAll from '@core-js/pure/full/string/match-all';

const s = 'abcabc';
const re = /abc/g;
const matchIter: RegExpStringIterator<RegExpExecArray> = stringMatchAll(s, re);

const result = stringMatchAll(s, re);
const assertType: RegExpStringIterator<RegExpExecArray> = result;

// @ts-expect-error
stringMatchAll(s);

// @ts-expect-error
stringMatchAll(s, 'abc');

// @ts-expect-error
const n: number = stringMatchAll(re);

// @ts-expect-error
stringMatchAll(s, {});

// @ts-expect-error
stringMatchAll(s, 123);

// @ts-expect-error
stringMatchAll(s, /abc/g, /def/g);
