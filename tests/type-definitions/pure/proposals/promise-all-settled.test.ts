import promiseAllSettled from '@core-js/pure/full/promise/all-settled';
import promiseResolve from '@core-js/pure/full/promise/resolve';

const promises = [promiseResolve(1), promiseResolve("foo"), 3] as const;
const arr = [promiseResolve(1), promiseResolve(2)];
const strArr = ["a", "b", "c"];
const promiseLike = { then: (cb: (val: number) => void) => cb(42) };

type PromiseResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult;

const settled2: Promise<PromiseResult<number>[]> = promiseAllSettled([promiseResolve(10), promiseResolve(20), 30]);
const settled3: Promise<PromiseResult<string>[]> = promiseAllSettled(strArr);
const settled4: Promise<PromiseResult<number>[]> = promiseAllSettled(new Set([1, 2, 3]));
const settled5: Promise<PromiseResult<number>[]> = promiseAllSettled([promiseLike]);

const emptyTuple: [] = [];
const settled6: Promise<[]> = promiseAllSettled(emptyTuple);

const mixedTuple = [42, promiseResolve("bar")] as const;
const settled7: Promise<[
  PromiseResult<number>,
  PromiseResult<string>
]> = promiseAllSettled(mixedTuple);

// @ts-expect-error
promiseAllSettled();

// @ts-expect-error
promiseAllSettled(5);

// @ts-expect-error
promiseAllSettled({ foo: 123 });

// @ts-expect-error
promiseAllSettled([1, 2], 123);

// @ts-expect-error
promiseAllSettled([promiseResolve(1)], "extra");
