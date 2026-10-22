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
Promise.allKeyed({
  a: 1,
  b: Promise.resolve('string'),
  c: 3,
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

const readonlyInput = { a: Promise.resolve(1), b: 'string' } as const;
Promise.allKeyed(readonlyInput).then(result => {
  result.a = 2;
});

interface Input {
  a: Promise<number>;
  b: string;
}
declare const input: Input;
const res3: Promise<{ a: number, b: string }> = Promise.allKeyed(input);

Promise.allKeyed([Promise.resolve(1), Promise.resolve(2)]);

// @ts-expect-error
Promise.allKeyed();
// @ts-expect-error
Promise.allKeyed(0);
// @ts-expect-error
Promise.allKeyed('string');
// @ts-expect-error
Promise.allKeyed(null);

const resASK: Promise<{ a: CoreJSPromiseResult<number>, b: CoreJSPromiseResult<string>, c: CoreJSPromiseResult<boolean> }> = Promise.allSettledKeyed({
  a: Promise.resolve(1),
  b: Promise.resolve('string'),
  c: Promise.resolve(true),
});

const resASK2: Promise<{ [sym]: CoreJSPromiseResult<number> }> = Promise.allSettledKeyed({
  [sym]: Promise.resolve(1),
});

Promise.allSettledKeyed({
  a: 1,
  b: Promise.resolve('string'),
  c: 3,
});

const resASK3: Promise<{ a: CoreJSPromiseResult<number>, b: CoreJSPromiseResult<string> }> = Promise.allSettledKeyed(input);

Promise.allSettledKeyed([Promise.resolve(1), Promise.resolve(2)]);

// @ts-expect-error
Promise.allSettledKeyed();
// @ts-expect-error
Promise.allSettledKeyed(0);
// @ts-expect-error
Promise.allSettledKeyed('string');
// @ts-expect-error
Promise.allSettledKeyed(undefined);
