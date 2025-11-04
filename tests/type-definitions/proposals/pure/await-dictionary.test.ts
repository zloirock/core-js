import allKeyed from '@core-js/pure/full/promise/all-keyed';
import allSettledKeyed from '@core-js/pure/full/promise/all-settled-keyed';

const res: Promise<{ a: number, b: string, c: boolean }> = allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});

const sym = Symbol('sym');
const res2: Promise<{ [sym]: number }> = allKeyed({
  [sym]: Promise.resolve(1)
});

// @ts-expect-error
allKeyed();
// @ts-expect-error
allKeyed({ a: 1, b: Promise.resolve(2) });
// @ts-expect-error
allKeyed([ Promise.resolve(1), Promise.resolve(2) ]);

declare type AllSettledKeyedResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult;
const resASK: Promise<{ a: AllSettledKeyedResult<number>, b: AllSettledKeyedResult<string>, c: AllSettledKeyedResult<boolean> }> = allSettledKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});

const resASK2: Promise<{ [sym]: AllSettledKeyedResult<number> }> = allSettledKeyed({
  [sym]: Promise.resolve(1)
});

// @ts-expect-error
allSettledKeyed();
// @ts-expect-error
allSettledKeyed({ a: 1, b: Promise.resolve(2) });
// @ts-expect-error
allSettledKeyed([ Promise.resolve(1), Promise.resolve(2) ]);
