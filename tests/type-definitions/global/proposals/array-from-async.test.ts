import 'core-js/full';
import fromAsync from 'core-js/full/array/from-async';
import fromAsyncJS from 'core-js/full/array/from-async.js';
import $Array from 'core-js/full/array';
import $ArrayIndex from 'core-js/full/array/index';
import $ArrayIndexJS from 'core-js/full/array/index.js';

const pNS: Promise<number[]> = fromAsync([1, 2, 3]);
const pNS2: Promise<number[]> = fromAsyncJS([1, 2, 3]);
const pNS3: Promise<number[]> = $Array.fromAsync([1, 2, 3]);
const pNS4: Promise<number[]> = $ArrayIndex.fromAsync([1, 2, 3]);
const pNS5: Promise<number[]> = $ArrayIndexJS.fromAsync([1, 2, 3]);

// @ts-expect-error
fromAsync([1, 2, 3], 'not a function');
// @ts-expect-error
fromAsyncJS([1, 2, 3], 'not a function');
// @ts-expect-error
$Array.fromAsync([1, 2, 3], 'not a function');
// @ts-expect-error
$ArrayIndex.fromAsync([1, 2, 3], 'not a function');
// @ts-expect-error
$ArrayIndexJS.fromAsync([1, 2, 3], 'not a function');

const p1: Promise<number[]> = Array.fromAsync([1, 2, 3]);
const p2: Promise<number[]> = Array.fromAsync([Promise.resolve(1), 2, 3]);
const p3: Promise<number[]> = Array.fromAsync((async function * () { yield 1; })());
const p4: Promise<string[]> = Array.fromAsync([1, 2, 3], (value: number, index: number) => value.toString());
const p5: Promise<number[]> = Array.fromAsync([Promise.resolve(1), 2, 3], (value: number) => value + 1);
const p6: Promise<number[]> = Array.fromAsync((async function * () { yield 1; })(), function (value: number) {
  return value * 2;
});
const p7: Promise<string[]> = Array.fromAsync([1, 2, 3], function (this: { foo: string }, value: number) { return value.toString(); }, { foo: 'str' });

async function t1() {
  const n: number[] = await Array.fromAsync([1, 2, 3]);
  const m: number[] = await Array.fromAsync([Promise.resolve(1), 2, 3]);
  const s: string[] = await Array.fromAsync([1, 2, 3], (value: number) => value.toString());
}

async function t2() {
  const bar: number[] = await Array.fromAsync([1, 2, 3], async (v: number) => v + 1);
  const foo: string[] = await Array.fromAsync([Promise.resolve(1), 2], async (v: number) => String(v));
}

declare const arrLike: { [index: number]: PromiseLike<number>; length: 2 };
const p8: Promise<number[]> = Array.fromAsync(arrLike);
const p9: Promise<number[]> = Array.fromAsync(arrLike, (value: number) => value);

// @ts-expect-error
Array.fromAsync([1, 2, 3], (value: string) => value);
// @ts-expect-error
Array.fromAsync([1, 2, 3], (value: string) => 1);
// @ts-expect-error
Array.fromAsync(['a', 'b', 'c'], (value: number) => value);
// @ts-expect-error
Array.fromAsync([Promise.resolve(1), 2, 3], (value: string) => value);
// @ts-expect-error
Array.fromAsync((async function * () { yield 'a'; })(), (value: number) => value);

declare const strArrLike: { [index: number]: string; length: 3 };
// @ts-expect-error
Array.fromAsync(strArrLike, (value: number) => value);
