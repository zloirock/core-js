import stringMatchAll from '@core-js/pure/full/string/match-all';

const s = 'abcabc';
const re = /abc/g;
stringMatchAll(s, re);

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
