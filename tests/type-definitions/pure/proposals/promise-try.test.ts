import promiseTry from '@core-js/pure/full/promise/try';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { AnyPromiseLike } from '../../helpers';

const pt1: AnyPromiseLike<number> = promiseTry(() => 42);
const pt2: AnyPromiseLike<string> = promiseTry(() => promiseResolve("hi"));
const pt3: AnyPromiseLike<number> = promiseTry((a: number, b: number) => a + b, 1, 2);
const pt4: AnyPromiseLike<string> = promiseTry((x: string) => x + "!!", "test");
const pt5: AnyPromiseLike<void> = promiseTry(() => {});
const pt6: AnyPromiseLike<boolean> = promiseTry((b: boolean) => b, false);

const pt7: AnyPromiseLike<number> = promiseTry((a: number, b: string, c: boolean) => c ? a : Number(b), 10, "100", true);
const pt8: AnyPromiseLike<string> = promiseTry((a: string) => promiseResolve(a), "bar");

declare function returnsPromise<T>(): AnyPromiseLike<T>;
const pt9: AnyPromiseLike<number> = promiseTry(() => returnsPromise<number>());

// @ts-expect-error
promiseTry();

// @ts-expect-error
promiseTry(42);

// @ts-expect-error
promiseTry("callback");

// @ts-expect-error
promiseTry({});

// @ts-expect-error
promiseTry([]);

// @ts-expect-error
promiseTry(() => 1, 2, "a", Symbol("x"));

// @ts-expect-error
promiseTry((a: boolean) => a, 123);
