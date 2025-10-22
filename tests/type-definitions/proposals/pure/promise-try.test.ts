import promiseTry from '@core-js/pure/full/promise/try';
import promiseResolve from '@core-js/pure/full/promise/resolve';

const pt1: Promise<number> = promiseTry(() => 42);
const pt2: Promise<string> = promiseTry(() => promiseResolve("hi"));
const pt3: Promise<number> = promiseTry((a: number, b: number) => a + b, 1, 2);
const pt4: Promise<string> = promiseTry((x: string) => x + "!!", "test");
const pt5: Promise<void> = promiseTry(() => {});
const pt6: Promise<boolean> = promiseTry((b: boolean) => b, false);

const pt7: Promise<number> = promiseTry((a: number, b: string, c: boolean) => c ? a : Number(b), 10, "100", true);
const pt8: Promise<string> = promiseTry((a: string) => promiseResolve(a), "bar");

declare function returnsPromise<T>(): Promise<T>;
const pt9: Promise<number> = promiseTry(() => returnsPromise<number>());

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
