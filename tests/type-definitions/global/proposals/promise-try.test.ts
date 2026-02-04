import 'core-js/full';
import promiseTry from 'core-js/full/promise/try';

const ptNS: Promise<number> = promiseTry(() => 42);

const pt1: Promise<number> = Promise.try(() => 42);
const pt2: Promise<string> = Promise.try(() => Promise.resolve('hi'));
const pt3: Promise<number> = Promise.try((a: number, b: number) => a + b, 1, 2);
const pt4: Promise<string> = Promise.try((x: string) => x + '!!', 'test');
const pt5: Promise<void> = Promise.try(() => {});
const pt6: Promise<boolean> = Promise.try((b: boolean) => b, false);

const pt7: Promise<number> = Promise.try((a: number, b: string, c: boolean) => c ? a : Number(b), 10, '100', true);
const pt8: Promise<string> = Promise.try((a: string) => Promise.resolve(a), 'bar');

declare function returnsPromise<T>(): Promise<T>;
const pt9: Promise<number> = Promise.try(() => returnsPromise<number>());

// @ts-expect-error
promiseTry();

// @ts-expect-error
Promise.try();
// @ts-expect-error
Promise.try(42);
// @ts-expect-error
Promise.try('callback');
// @ts-expect-error
Promise.try({});
// @ts-expect-error
Promise.try([]);
// @ts-expect-error
Promise.try(() => 1, 2, 'a', Symbol('x'));
// @ts-expect-error
Promise.try((a: boolean) => a, 123);
