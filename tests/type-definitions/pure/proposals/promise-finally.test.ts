import promiseFinally from '@core-js/pure/full/promise/finally';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import promiseReject from '@core-js/pure/full/promise/reject';
import { CoreJSPromiseLike } from '../../helpers';

const pr1: CoreJSPromiseLike<number> = promiseResolve(42);
declare const p1: Promise<number>;
const pf1: CoreJSPromiseLike<number> = promiseFinally(p1);
const pf2: CoreJSPromiseLike<number> = promiseFinally(p1, undefined);
const pf3: CoreJSPromiseLike<number> = promiseFinally(p1, null);
const pf4: CoreJSPromiseLike<number> = promiseFinally(p1, () => {});
const pf5: CoreJSPromiseLike<number> = promiseFinally(p1, function () {});

const pr2: CoreJSPromiseLike<never> = promiseReject("err");
declare const p2: Promise<never>;
const pf6: CoreJSPromiseLike<string> = promiseFinally(p2);
const pf7: CoreJSPromiseLike<string> = promiseFinally(p2, () => {});

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
