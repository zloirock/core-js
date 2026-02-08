import promiseAllKeyed from '@core-js/pure/full/promise/all-keyed';
import promiseAllSettledKeyed from '@core-js/pure/full/promise/all-settled-keyed';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { assertCoreJSPromiseLike } from '../../helpers.pure.js';

const res = promiseAllKeyed({
  a: promiseResolve(1),
  b: promiseResolve('string'),
  c: promiseResolve(true),
});
assertCoreJSPromiseLike<{ a: number, b: string, c: boolean }>(res);

declare const sym: unique symbol;
const res2 = promiseAllKeyed({
  [sym]: promiseResolve(1),
});
assertCoreJSPromiseLike<{ [sym]: number }>(res2);

// @ts-expect-error
promiseAllKeyed();
// @ts-expect-error
promiseAllKeyed({ a: 1, b: promiseResolve(2) });
// @ts-expect-error
promiseAllKeyed([promiseResolve(1), promiseResolve(2)]);

// @ts-expect-error
promiseAllSettledKeyed();
// @ts-expect-error
promiseAllSettledKeyed({ a: 1, b: promiseResolve(2) });
// @ts-expect-error
promiseAllSettledKeyed([promiseResolve(1), promiseResolve(2)]);
