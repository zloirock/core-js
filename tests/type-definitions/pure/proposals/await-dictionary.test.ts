import promiseAllKeyed from '@core-js/pure/full/promise/all-keyed';
import promiseAllSettledKeyed from '@core-js/pure/full/promise/all-settled-keyed';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import $Symbol from '@core-js/pure/full/symbol';
import { CoreJSPromiseOrPromiseLike } from '../../helpers';

const res: CoreJSPromiseOrPromiseLike<{ a: number, b: string, c: boolean }> = promiseAllKeyed({
  a: promiseResolve(1),
  b: promiseResolve('string'),
  c: promiseResolve(true),
});

const sym = $Symbol('sym');
const res2: CoreJSPromiseOrPromiseLike<{ [sym]: number }> = promiseAllKeyed({
  [sym]: promiseResolve(1)
});

// @ts-expect-error
promiseAllKeyed();
// @ts-expect-error
promiseAllKeyed({ a: 1, b: promiseResolve(2) });
// @ts-expect-error
promiseAllKeyed([ promiseResolve(1), promiseResolve(2) ]);

// @ts-expect-error
promiseAllSettledKeyed();
// @ts-expect-error
promiseAllSettledKeyed({ a: 1, b: promiseResolve(2) });
// @ts-expect-error
promiseAllSettledKeyed([ promiseResolve(1), promiseResolve(2) ]);
