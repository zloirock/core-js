import arrayFromAsync from '@core-js/pure/full/array/from-async';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { assertCoreJSPromiseLike } from '../../helpers.pure.js';

const p1 = arrayFromAsync([1, 2, 3]);
assertCoreJSPromiseLike<number[]>(p1);
const p2 = arrayFromAsync([promiseResolve(1), 2, 3]);
assertCoreJSPromiseLike<number[]>(p2);
const p3 = arrayFromAsync([1, 2, 3], (value: number, index: number) => value.toString());
assertCoreJSPromiseLike<string[]>(p3);
const p4 = arrayFromAsync([promiseResolve(1), 2, 3], (value: number) => value + 1);
assertCoreJSPromiseLike<number[]>(p4);
const p5 = arrayFromAsync([1, 2, 3], function (this: { foo: string }, value: number) { return value.toString(); }, { foo: 'str' });
assertCoreJSPromiseLike<string[]>(p5);

async function t1() {
  const n: number[] = await arrayFromAsync([1, 2, 3]);
  const m: number[] = await arrayFromAsync([Promise.resolve(1), 2, 3]);
  const s: string[] = await arrayFromAsync([1, 2, 3], (value: number) => value.toString());
}

async function t2() {
  const bar: number[] = await arrayFromAsync([1, 2, 3], async (v: number) => v + 1);
  const foo: string[] = await arrayFromAsync([Promise.resolve(1), 2], async (v: number) => String(v));
}

declare const arrLike: { [index: number]: PromiseLike<number>; length: 2 };
const p6 = arrayFromAsync(arrLike);
assertCoreJSPromiseLike<number[]>(p6);
const p7 = arrayFromAsync(arrLike, (value: number) => value);
assertCoreJSPromiseLike<number[]>(p7);

// @ts-expect-error
arrayFromAsync([1, 2, 3], (value: string) => value);
// @ts-expect-error
arrayFromAsync([1, 2, 3], (value: string) => 1);
// @ts-expect-error
arrayFromAsync(['a', 'b', 'c'], (value: number) => value);
// @ts-expect-error
arrayFromAsync([Promise.resolve(1), 2, 3], (value: string) => value);
// // @ts-expect-error
// arrayFromAsync((async function* () { yield 'a'; })(), (value: number) => value);

declare const strArrLike: { [index: number]: string; length: 3 };
// @ts-expect-error
arrayFromAsync(strArrLike, (value: number) => value);
