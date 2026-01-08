import promiseTry from '@core-js/pure/full/promise/try';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { CoreJSPromiseAndPromiseLike } from '../../helpers';

const pt1: CoreJSPromiseAndPromiseLike<number> = promiseTry(() => 42);
const pt2: CoreJSPromiseAndPromiseLike<string> = promiseTry(() => promiseResolve("hi"));
const pt3: CoreJSPromiseAndPromiseLike<number> = promiseTry((a: number, b: number) => a + b, 1, 2);
const pt4: CoreJSPromiseAndPromiseLike<string> = promiseTry((x: string) => x + "!!", "test");
const pt5: CoreJSPromiseAndPromiseLike<void> = promiseTry(() => {});
const pt6: CoreJSPromiseAndPromiseLike<boolean> = promiseTry((b: boolean) => b, false);

const pt7: CoreJSPromiseAndPromiseLike<number> = promiseTry((a: number, b: string, c: boolean) => c ? a : Number(b), 10, "100", true);
const pt8: CoreJSPromiseAndPromiseLike<string> = promiseTry((a: string) => promiseResolve(a), "bar");

declare function returnsPromise<T>(): CoreJSPromiseAndPromiseLike<T>;
const pt9: CoreJSPromiseAndPromiseLike<number> = promiseTry(() => returnsPromise<number>());

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
