import promiseFinally from '@core-js/pure/full/promise/finally';
import promiseResolve from '@core-js/pure/full/promise/resolve';

const p1 = promiseResolve(42);
const pf1: Promise<number> = promiseFinally(p1);
const pf2: Promise<number> = promiseFinally(p1, undefined);
const pf3: Promise<number> = promiseFinally(p1, null);
const pf4: Promise<number> = promiseFinally(p1, () => {});
const pf5: Promise<number> = promiseFinally(p1, function () {});

const p2 = Promise.reject("err");
const pf6: Promise<string> = promiseFinally(p2);
const pf7: Promise<string> = promiseFinally(p2, () => {});

declare function returnsPromise<T>(): Promise<T>;
const genericF: Promise<boolean> = returnsPromise<boolean>().finally(() => {});

// @ts-expect-error
promiseFinally(p1, 123);

// @ts-expect-error
promiseFinally(p1, "foo");

// @ts-expect-error
promiseFinally(p1, {});

// @ts-expect-error
promiseFinally(p1, []);

// @ts-expect-error
promiseFinally(p1, () => {}, "extra");

// @ts-expect-error
promiseFinally(p1, true);

// @ts-expect-error
promiseFinally(p1, Symbol("x"));
