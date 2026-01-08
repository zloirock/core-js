import promiseAllSettled from '@core-js/pure/full/promise/all-settled';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { CoreJSPromiseAndPromiseLike } from '../../helpers';

interface CoreJSPromiseResult<T> {
  status: string;
  value?: T;
  reason?: any;
}

const promiseLike = { then: (cb: (val: number) => void) => cb(42) };

const p1: CoreJSPromiseAndPromiseLike<[CoreJSPromiseResult<number>, CoreJSPromiseResult<number>, CoreJSPromiseResult<number>]> =
  promiseAllSettled([promiseResolve(10), promiseResolve(20), 30]);
const p2: CoreJSPromiseAndPromiseLike<[CoreJSPromiseResult<string>, CoreJSPromiseResult<string>, CoreJSPromiseResult<string>]> =
  promiseAllSettled(['a', 'b', 'c']);
const p3: CoreJSPromiseAndPromiseLike<CoreJSPromiseResult<number>[]> =
  promiseAllSettled(new Set([1, 2, 3]));
promiseAllSettled([promiseLike]);

const emptyTuple: [] = [];
const settled6: CoreJSPromiseAndPromiseLike<[]> = promiseAllSettled(emptyTuple);

const mixedTuple = [42, promiseResolve('bar')] as const;
const p4: CoreJSPromiseAndPromiseLike<[CoreJSPromiseResult<number>, CoreJSPromiseResult<string>]> =
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
promiseAllSettled([promiseResolve(1)], 'extra');
