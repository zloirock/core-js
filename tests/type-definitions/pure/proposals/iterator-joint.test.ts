import iteratorZip from '@core-js/pure/full/iterator/zip';
import iteratorZipKeyed from '@core-js/pure/full/iterator/zip-keyed';
import { assertCoreJSIteratorLike } from '../../helpers/helpers.pure.js';

const zipped1 = iteratorZip([[1, 2, 3], [4, 5, 6]]);
assertCoreJSIteratorLike<number[]>(zipped1);
const zipped2 = iteratorZip([['a', 'b', 'c'], ['d', 'e', 'f']]);
assertCoreJSIteratorLike<string[]>(zipped2);
const zipped3 = iteratorZip([[1, 2, 3], [4, 5, 6]], { mode: 'shortest' });
assertCoreJSIteratorLike<number[]>(zipped3);
const zipped4 = iteratorZipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });
assertCoreJSIteratorLike<Record<PropertyKey, number>>(zipped4);
const zipped5 = iteratorZipKeyed({ a: ['a', 'b', 'c', 'd'], b: ['e', 'f'] }, { mode: 'shortest' });
assertCoreJSIteratorLike<Record<PropertyKey, string>>(zipped5);

declare const numbers: Iterator<number>;
declare const iterables: Iterable<Iterable<number>>;

const zipped6: [number, string][] = iteratorZip([[1], ['a']] as const, { mode: 'strict' }).toArray();
const zipped7: [number, string][] = iteratorZip([[1], ['a']] as const, { mode: 'longest', padding: [1, 'a'] }).toArray();
const zipped8: [number | undefined, string | undefined][] = iteratorZip([[1], ['a']] as const, { mode: 'longest' }).toArray();
const zipped9: never[] = iteratorZip([]).toArray();
const zipped10: number[][] = iteratorZip(iterables).toArray();
const zipped11: (number | undefined)[][] = iteratorZip(iterables, { mode: 'longest' }).toArray();
const zipped12: [number, string][] = iteratorZip([numbers, ['a']]).toArray();
// @ts-expect-error
const zipped13: [number, string][] = iteratorZip([[1], ['a']] as const, { mode: 'longest' }).toArray();
// @ts-expect-error
const zipped14: number[][] = iteratorZip(iterables, { mode: 'longest' }).toArray();

const zippedKeyed1: { a: number | undefined; b: string | undefined }[] = iteratorZipKeyed({ a: [1], b: ['a'] }, { mode: 'longest' }).toArray();
const zippedKeyed2: { a: number; b: string }[] = iteratorZipKeyed({ a: [1], b: ['a'] }, { mode: 'longest', padding: { a: 0, b: '' } }).toArray();
const zippedKeyed3: { a: number }[] = iteratorZipKeyed({ a: [1], b: undefined }).toArray();
const zippedKeyed4: { a: number; b: number }[] = iteratorZipKeyed({ a: [1], b: numbers }).toArray();
// @ts-expect-error
const zippedKeyed5: { a: number; b: string }[] = iteratorZipKeyed({ a: [1], b: ['a'] }, { mode: 'longest', padding: { a: 0 } }).toArray();

// @ts-expect-error
iteratorZip(true);
// @ts-expect-error
iteratorZip([[1, 2, 3], [4, 5, 6]], { mode: 'incorrect' });
// @ts-expect-error
iteratorZipKeyed(42);
// @ts-expect-error
iteratorZipKeyed({ a: [1, 2, 3], b: [4, 5, 6] }, { foo: 'bar' });
// @ts-expect-error
iteratorZip([[1]], { mode: 'shortest', padding: [1] });
// @ts-expect-error
iteratorZip([['a']], { mode: 'longest', padding: 'ab' });
// @ts-expect-error
iteratorZip('ab');
// @ts-expect-error
iteratorZip(['ab']);
// @ts-expect-error
iteratorZip([undefined]);
// @ts-expect-error
iteratorZipKeyed('ab');
// @ts-expect-error
iteratorZipKeyed(null);
