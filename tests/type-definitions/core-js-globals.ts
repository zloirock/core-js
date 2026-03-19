// Type tests for core-js global polyfill type declarations
// This file should compile without errors when referenced alongside
// packages/core-js/index.d.ts

/// <reference path="../../packages/core-js/index.d.ts" />

// ---------------------------------------------------------------------------
// Array
// ---------------------------------------------------------------------------

const arr = [1, 2, 3, 4, 5];

// .at()
const atResult: number | undefined = arr.at(-1);

// .find / .findLast
const found: number | undefined = arr.findLast(x => x > 2);
const foundIdx: number = arr.findLastIndex(x => x > 2);

// .flat / .flatMap
const nested = [[1, 2], [3, 4]];
const flat: number[] = nested.flat();
const flatMapped: number[] = arr.flatMap(x => [x, x * 2]);

// .includes
const inc: boolean = arr.includes(3);

// .toReversed / .toSorted / .toSpliced / .with (ES2023 non-mutating)
const reversed: number[] = arr.toReversed();
const sorted: number[] = arr.toSorted((a, b) => a - b);
const spliced: number[] = arr.toSpliced(1, 1, 99);
const withed: number[] = arr.with(0, 42);

// Array.from
const fromArr: number[] = Array.from([1, 2, 3]);
const fromMapped: string[] = Array.from([1, 2, 3], x => String(x));

// Array.fromAsync
const fromAsyncResult: Promise<number[]> = Array.fromAsync([
  Promise.resolve(1),
  Promise.resolve(2),
]);

// Array.of
const ofArr: number[] = Array.of(1, 2, 3);

// Array.isArray
const isArr: boolean = Array.isArray([]);

// ReadonlyArray support
const readonlyArr: readonly number[] = [1, 2, 3];
const readonlyAt: number | undefined = readonlyArr.at(0);
const readonlyFindLast: number | undefined = readonlyArr.findLast(x => x > 1);

// ---------------------------------------------------------------------------
// Object
// ---------------------------------------------------------------------------

// Object.assign
const assigned: { a: number } & { b: string } = Object.assign({ a: 1 }, { b: 'x' });

// Object.entries / .keys / .values
const entries: [string, number][] = Object.entries({ a: 1, b: 2 });
const keys: string[] = Object.keys({ a: 1 });
const values: number[] = Object.values({ a: 1, b: 2 });

// Object.fromEntries
const fromEntries: { [k: string]: number } = Object.fromEntries([['a', 1], ['b', 2]]);
const fromEntriesMap: { [k: string]: number } = Object.fromEntries(
  new Map([['a', 1], ['b', 2]]),
);

// Object.groupBy
const grouped: Partial<Record<string, number[]>> = Object.groupBy(
  [1, 2, 3, 4],
  n => (n % 2 === 0 ? 'even' : 'odd'),
);

// Object.hasOwn
const hasOwn: boolean = Object.hasOwn({ a: 1 }, 'a');

// Object.is
const isSame: boolean = Object.is(NaN, NaN);

// Object.getOwnPropertyDescriptors
const descriptors = Object.getOwnPropertyDescriptors({ a: 1 });

// ---------------------------------------------------------------------------
// Promise
// ---------------------------------------------------------------------------

// Promise.allSettled
const settled: Promise<PromiseSettledResult<number>[]> = Promise.allSettled([
  Promise.resolve(1),
  Promise.resolve(2),
]);

// Promise.any
const anyResult: Promise<number> = Promise.any([
  Promise.resolve(1),
  Promise.reject('err'),
]);

// Promise.withResolvers
const { promise, resolve, reject } = Promise.withResolvers<number>();
const promiseCheck: Promise<number> = promise;
resolve(42);
reject(new Error('fail'));

// Promise.try
const tryResult: Promise<number> = Promise.try(() => 42);
const tryAsyncResult: Promise<string> = Promise.try(async () => 'hello');
const tryWithArgs: Promise<number> = Promise.try((a: number, b: number) => a + b, 1, 2);

// ---------------------------------------------------------------------------
// String
// ---------------------------------------------------------------------------

const str = 'hello world';

// .at()
const strAt: string | undefined = str.at(-1);

// .includes / .startsWith / .endsWith
const strInc: boolean = str.includes('world');
const startsWith: boolean = str.startsWith('hello');
const endsWith: boolean = str.endsWith('world');

// .padStart / .padEnd
const padded: string = str.padStart(20, '*');
const paddedEnd: string = str.padEnd(20, '-');

// .trimStart / .trimEnd
const trimmed: string = '  hello  '.trimStart();
const trimmedEnd: string = '  hello  '.trimEnd();

// .replaceAll
const replaced: string = str.replaceAll('l', 'L');

// .repeat
const repeated: string = 'abc'.repeat(3);

// .matchAll
const matches: IterableIterator<RegExpMatchArray> = 'aabbcc'.matchAll(/(.)\1/g);

// .codePointAt
const cp: number | undefined = str.codePointAt(0);

// .isWellFormed / .toWellFormed
const wellFormed: boolean = str.isWellFormed();
const toWellFormed: string = str.toWellFormed();

// String.fromCodePoint
const fromCP: string = String.fromCodePoint(9731, 9733, 9842);

// String.raw
const raw: string = String.raw`hello\nworld`;
