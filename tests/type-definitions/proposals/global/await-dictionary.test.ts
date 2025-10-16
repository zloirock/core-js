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
