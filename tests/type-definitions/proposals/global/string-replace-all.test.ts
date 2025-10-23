import 'core-js/full';

const s = 'foo bar foo';

const r1: string = s.replaceAll('foo', 'baz');
const r2: string = s.replaceAll(/foo/g, 'baz');
const r3: string = s.replaceAll('bar', (substr: string) => substr);
const r4: string = s.replaceAll(/bar/g, (substr: string) => substr + 'Test');
const r5: string = s.replaceAll('foo', function(substring: string): string { return substring + '!'; });
const r6: string = s.replaceAll(/foo/g, (match: string, ...args: any[]) => match + args.length);

// @ts-expect-error
s.replaceAll();

// @ts-expect-error
s.replaceAll('foo');

// @ts-expect-error
s.replaceAll('foo', 1);

// @ts-expect-error
s.replaceAll('foo', {});

// @ts-expect-error
s.replaceAll(/foo/, 'bar', 'extra');

// @ts-expect-error
s.replaceAll(/foo/g, (match: string) => 123);

// @ts-expect-error
s.replaceAll(/foo/g, 5);

// @ts-expect-error
const n: number = s.replaceAll('foo', 'baz');
