import 'core-js/full';

const res: Promise<{ a: number, b: string, c: boolean }> = Promise.allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});

const sym = Symbol('sym');
const res2: Promise<{ [sym]: number }> = Promise.allKeyed({
  [sym]: Promise.resolve(1)
});

// @ts-expect-error
Promise.allKeyed();
// @ts-expect-error
Promise.allKeyed({ a: 1, b: Promise.resolve(2) });
// @ts-expect-error
Promise.allKeyed([ Promise.resolve(1), Promise.resolve(2) ]);

declare type AllSettledKeyedResult<T> = PromiseFulfilledResult<T> | PromiseRejectedResult;
const resASK: Promise<{ a: AllSettledKeyedResult<number>, b: AllSettledKeyedResult<string>, c: AllSettledKeyedResult<boolean> }> = Promise.allSettledKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});

const resASK2: Promise<{ [sym]: AllSettledKeyedResult<number> }> = Promise.allSettledKeyed({
  [sym]: Promise.resolve(1)
});

// @ts-expect-error
Promise.allSettledKeyed();
// @ts-expect-error
Promise.allSettledKeyed({ a: 1, b: Promise.resolve(2) });
// @ts-expect-error
Promise.allSettledKeyed([ Promise.resolve(1), Promise.resolve(2) ]);
