import regexpEscape from '@core-js/pure/full/regexp/escape';

const escaped1: string = regexpEscape('foo.*+?^${}()|[]\\');
const escaped2: string = regexpEscape('');
const s = 'abc';
const escaped3: string = regexpEscape(s);

// @ts-expect-error
regexpEscape();
// @ts-expect-error
regexpEscape(123);
// @ts-expect-error
regexpEscape();
// @ts-expect-error
regexpEscape({});
// @ts-expect-error
regexpEscape(/abc/);
// @ts-expect-error
regexpEscape([]);
// @ts-expect-error
const wrong: number = regexpEscape('boo');
// @ts-expect-error
regexpEscape('foo', 'bar');
