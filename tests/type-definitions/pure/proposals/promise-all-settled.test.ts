import promiseAllSettled from '@core-js/pure/full/promise/all-settled';
import promiseResolve from '@core-js/pure/full/promise/resolve';

promiseResolve(1);
promiseResolve('foo');
const promiseLike = { then: (cb: (val: number) => void) => cb(42) };

promiseAllSettled([promiseResolve(10), promiseResolve(20), 30]);
promiseAllSettled(['a', 'b', 'c']);
promiseAllSettled(new Set([1, 2, 3]));
promiseAllSettled([promiseLike]);

const emptyTuple: [] = [];
const settled6: Promise<[]> = promiseAllSettled(emptyTuple);

const mixedTuple = [42, promiseResolve("bar")] as const;
promiseAllSettled(mixedTuple);

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
