import stringReplaceAll from '@core-js/pure/full/string/replace-all';

const s = 'foo bar foo';

const r1: string = stringReplaceAll(s, 'foo', 'baz');
const r2: string = stringReplaceAll(s, /foo/g, 'baz');
const r3: string = stringReplaceAll(s, 'bar', (substr: string) => substr);
const r4: string = stringReplaceAll(s, /bar/g, (substr: string) => substr + 'Test');
const r5: string = stringReplaceAll(s, 'foo', function (substring: string): string { return substring + '!'; });
const r6: string = stringReplaceAll(s, /foo/g, (match: string, ...args: any[]) => match + args.length);

// @ts-expect-error
stringReplaceAll(s);

// @ts-expect-error
stringReplaceAll(s, 'foo');

// @ts-expect-error
stringReplaceAll(s, 'foo', 1);

// @ts-expect-error
stringReplaceAll(s, 'foo', {});

// @ts-expect-error
stringReplaceAll(s, /foo/, 'bar', 'extra');

// @ts-expect-error
stringReplaceAll(s, /foo/g, (match: string) => 123);

// @ts-expect-error
stringReplaceAll(s, /foo/g, 5);

// @ts-expect-error
const n: number = stringReplaceAll(s, 'foo', 'baz');
