import 'core-js/full';
import allKeyed from 'core-js/full/promise/all-keyed';
import allSettledKeyed from 'core-js/full/promise/all-settled-keyed';
import $Promise from 'core-js/full/promise';

const sym = Symbol('sym');
interface CoreJSPromiseResult<T> {
  status: string;
  value?: T;
  reason?: any;
}

const resNS: Promise<{ a: number, b: string, c: boolean }> = allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});
const resNS2: Promise<{ a: number, b: string, c: boolean }> = $Promise.allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});
const resNS3: Promise<{ [sym]: CoreJSPromiseResult<number> }> = allSettledKeyed({
  [sym]: Promise.resolve(1),
});

// @ts-expect-error
allKeyed();
// @ts-expect-error
allSettledKeyed();

const res: Promise<{ a: number, b: string, c: boolean }> = Promise.allKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});

const res2: Promise<{ [sym]: number }> = Promise.allKeyed({
  [sym]: Promise.resolve(1),
});

// @ts-expect-error
Promise.allKeyed();
// @ts-expect-error
Promise.allKeyed({ a: 1, b: Promise.resolve(2) });
// @ts-expect-error
Promise.allKeyed([Promise.resolve(1), Promise.resolve(2)]);

const resASK: Promise<{ a: CoreJSPromiseResult<number>, b: CoreJSPromiseResult<string>, c: CoreJSPromiseResult<boolean> }> = Promise.allSettledKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});

const resASK2: Promise<{ [sym]: CoreJSPromiseResult<number> }> = Promise.allSettledKeyed({
  [sym]: Promise.resolve(1),
});

// @ts-expect-error
Promise.allSettledKeyed();
// @ts-expect-error
Promise.allSettledKeyed({ a: 1, b: Promise.resolve(2) });
// @ts-expect-error
Promise.allSettledKeyed([Promise.resolve(1), Promise.resolve(2)]);
