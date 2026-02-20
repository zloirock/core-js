import promiseAllKeyed from '@core-js/pure/full/promise/all-keyed';
import promiseAllSettledKeyed from '@core-js/pure/full/promise/all-settled-keyed';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { assertCoreJSPromiseLike } from '../../helpers/helpers.pure.js';

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

promiseAllKeyed({
  a: 1,
  b: promiseResolve('string'),
  c: 3,
});

// @ts-expect-error
promiseAllKeyed();
// @ts-expect-error
promiseAllKeyed([promiseResolve(1), promiseResolve(2)]);

promiseAllSettledKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});

promiseAllSettledKeyed({
  [sym]: Promise.resolve(1),
});

promiseAllSettledKeyed({
  a: 1,
  b: Promise.resolve('string'),
  c: 3,
});

// @ts-expect-error
promiseAllSettledKeyed();
// @ts-expect-error
promiseAllSettledKeyed([promiseResolve(1), promiseResolve(2)]);
