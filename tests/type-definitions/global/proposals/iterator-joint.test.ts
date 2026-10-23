import 'core-js/actual';
import zip from 'core-js/actual/iterator/zip';
import zipKeyed from 'core-js/actual/iterator/zip-keyed';
import $Iterator from 'core-js/actual/iterator';

zip([[1, 2, 3], [4, 5, 6]]);
$Iterator.zip([[1, 2, 3], [4, 5, 6]]);
zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });
$Iterator.zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });

Iterator.zip([[1, 2, 3], [4, 5, 6]]);
Iterator.zip([['a', 'b', 'c'], ['d', 'e', 'f']]);
Iterator.zip([[1, 2, 3], [4, 5, 6]], { mode: 'shortest' });
Iterator.zip([[1, 2, 3], [4, 5, 6]], { mode: 'strict' });
Iterator.zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });
Iterator.zipKeyed({ a: ['a', 'b', 'c', 'd'], b: ['e', 'f'] }, { mode: 'shortest' });
Iterator.zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] }, { mode: 'strict' });

declare const numbers: Iterator<number>;
declare const iterables: Iterable<Iterable<number>>;

const zipped1: [number, string][] = Iterator.zip([[1, 2], new Set(['a', 'b'])] as const).toArray();
const zipped2: [number, string][] = Iterator.zip([[1], ['a']] as const, { mode: 'strict' }).toArray();
const zipped3: [number, string][] = Iterator.zip([[1], ['a']] as const, { mode: 'longest', padding: [1, 'a'] }).toArray();
const zipped4: [number | undefined, string | undefined][] = Iterator.zip([[1], ['a']] as const, { mode: 'longest' }).toArray();
const zipped5: never[] = Iterator.zip([]).toArray();
const zipped6: number[][] = Iterator.zip(iterables).toArray();
const zipped7: (number | undefined)[][] = Iterator.zip(iterables, { mode: 'longest' }).toArray();
const zipped8: [number, string][] = Iterator.zip([numbers, ['a']]).toArray();
// @ts-expect-error
const zipped9: [number, string][] = Iterator.zip([[1], ['a']] as const, { mode: 'longest' }).toArray();
// @ts-expect-error
const zipped10: number[][] = Iterator.zip(iterables, { mode: 'longest' }).toArray();

const zippedKeyed1: { a: number; b: string }[] = Iterator.zipKeyed({ a: [1, 2], b: new Set(['a', 'b']) }).toArray();
const zippedKeyed2: { a: number | undefined; b: string | undefined }[] = Iterator.zipKeyed({ a: [1], b: ['a'] }, { mode: 'longest' }).toArray();
const zippedKeyed3: { a: number; b: string }[] = Iterator.zipKeyed({ a: [1], b: ['a'] }, { mode: 'longest', padding: { a: 0, b: '' } }).toArray();
const zippedKeyed4: { a: number }[] = Iterator.zipKeyed({ a: [1], b: undefined }).toArray();
const zippedKeyed5: { a: number; b: number }[] = Iterator.zipKeyed({ a: [1], b: numbers }).toArray();
// @ts-expect-error
const zippedKeyed6: { a: number; b: string }[] = Iterator.zipKeyed({ a: [1], b: ['a'] }, { mode: 'longest', padding: { a: 0 } }).toArray();

// @ts-expect-error
Iterator.zip(true);
// @ts-expect-error
Iterator.zip([[1, 2, 3], [4, 5, 6]], { mode: 'incorrect' });
// @ts-expect-error
Iterator.zip([[1, 2, 3], [4, 5, 6]], { mode: 'invalid' });
// @ts-expect-error
Iterator.zipKeyed(42);
// @ts-expect-error
Iterator.zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] }, { foo: 'bar' });
// @ts-expect-error
Iterator.zip([[1]], { mode: 'shortest', padding: [1] });
// @ts-expect-error
Iterator.zip([['a']], { mode: 'longest', padding: 'ab' });
// @ts-expect-error
Iterator.zip('ab');
// @ts-expect-error
Iterator.zip(['ab']);
// @ts-expect-error
Iterator.zip([undefined]);
// @ts-expect-error
Iterator.zipKeyed('ab');
// @ts-expect-error
Iterator.zipKeyed(null);
