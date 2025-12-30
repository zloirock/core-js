import promiseAllKeyed from '@core-js/pure/full/promise/all-keyed';
import promiseAllSettledKeyed from '@core-js/pure/full/promise/all-settled-keyed';

const res: Promise<{ a: number, b: string, c: boolean }> = promiseAllKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});

const sym = Symbol('sym');
const res2: Promise<{ [sym]: number }> = promiseAllKeyed({
  [sym]: Promise.resolve(1)
});

// @ts-expect-error
promiseAllKeyed();
// @ts-expect-error
promiseAllKeyed({ a: 1, b: Promise.resolve(2) });
// @ts-expect-error
promiseAllKeyed([ Promise.resolve(1), Promise.resolve(2) ]);

// @ts-expect-error
promiseAllSettledKeyed();
// @ts-expect-error
promiseAllSettledKeyed({ a: 1, b: Promise.resolve(2) });
// @ts-expect-error
promiseAllSettledKeyed([ Promise.resolve(1), Promise.resolve(2) ]);
