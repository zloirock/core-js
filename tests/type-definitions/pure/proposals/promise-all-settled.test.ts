import promiseAllSettled from '@core-js/pure/full/promise/all-settled';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { assertCoreJSPromiseLike } from '../../helpers';

interface CoreJSPromiseResult<T> {
  status: string;
  value?: T;
  reason?: any;
}

const promiseLike = { then: (cb: (val: number) => void) => cb(42) };

const p1 = promiseAllSettled([promiseResolve(10), promiseResolve(20), 30]);
assertCoreJSPromiseLike<[CoreJSPromiseResult<number>, CoreJSPromiseResult<number>, CoreJSPromiseResult<number>]>(p1);
const p2 = promiseAllSettled(['a', 'b', 'c']);
assertCoreJSPromiseLike<[CoreJSPromiseResult<string>, CoreJSPromiseResult<string>, CoreJSPromiseResult<string>]>(p2);
const p3 = promiseAllSettled(new Set([1, 2, 3]));
assertCoreJSPromiseLike<CoreJSPromiseResult<number>[]>(p3);
promiseAllSettled([promiseLike]);

const emptyTuple: [] = [];
const settled6 = promiseAllSettled(emptyTuple);
assertCoreJSPromiseLike<[]>(settled6);

const mixedTuple = [42, promiseResolve('bar')] as const;
const p4 = promiseAllSettled(mixedTuple);
assertCoreJSPromiseLike<[CoreJSPromiseResult<number>, CoreJSPromiseResult<string>]>(p4);

// @ts-expect-error
promiseAllSettled();

// @ts-expect-error
promiseAllSettled(5);

// @ts-expect-error
promiseAllSettled({ foo: 123 });

// @ts-expect-error
promiseAllSettled([1, 2], 123);

// @ts-expect-error
promiseAllSettled([promiseResolve(1)], 'extra');
