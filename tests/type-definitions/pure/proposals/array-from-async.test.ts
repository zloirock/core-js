import arrayFromAsync from '@core-js/pure/full/array/from-async';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { CoreJSPromiseOrPromiseLike } from '../../helpers';

const p1: CoreJSPromiseOrPromiseLike<number[]> = arrayFromAsync([1, 2, 3]);
const p2: CoreJSPromiseOrPromiseLike<number[]> = arrayFromAsync([promiseResolve(1), 2, 3]);
const p3: CoreJSPromiseOrPromiseLike<string[]> = arrayFromAsync([1, 2, 3], (value: number, index: number) => value.toString());
const p4: CoreJSPromiseOrPromiseLike<number[]> = arrayFromAsync([promiseResolve(1), 2, 3], (value: number) => value + 1);
const p5: CoreJSPromiseOrPromiseLike<string[]> = arrayFromAsync([1, 2, 3], function (this: { foo: string }, value: number) { return value.toString(); }, { foo: 'str' });

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
const p6: CoreJSPromiseOrPromiseLike<number[]> = arrayFromAsync(arrLike);
const p7: CoreJSPromiseOrPromiseLike<number[]> = arrayFromAsync(arrLike, (value: number) => value);

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
