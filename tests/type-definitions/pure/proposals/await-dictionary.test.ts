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

const readonlyInput = { a: promiseResolve(1), b: 'string' } as const;
promiseAllKeyed(readonlyInput).then(result => {
  result.a = 2;
});

interface Input {
  a: Promise<number>;
  b: string;
}
declare const input: Input;
const res3 = promiseAllKeyed(input);
assertCoreJSPromiseLike<{ a: number, b: string }>(res3);

promiseAllKeyed([promiseResolve(1), promiseResolve(2)]);

// @ts-expect-error
promiseAllKeyed();
// @ts-expect-error
promiseAllKeyed(0);
// @ts-expect-error
promiseAllKeyed('string');
// @ts-expect-error
promiseAllKeyed(null);

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

promiseAllSettledKeyed(input);

promiseAllSettledKeyed([promiseResolve(1), promiseResolve(2)]);

// @ts-expect-error
promiseAllSettledKeyed();
// @ts-expect-error
promiseAllSettledKeyed(0);
// @ts-expect-error
promiseAllSettledKeyed('string');
// @ts-expect-error
promiseAllSettledKeyed(undefined);
