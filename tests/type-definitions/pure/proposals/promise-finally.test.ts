import promiseFinally from '@core-js/pure/full/promise/finally';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import promiseReject from '@core-js/pure/full/promise/reject';
import { assertCoreJSPromiseLike } from '../../helpers.pure';

const pr1 = promiseResolve(42);
assertCoreJSPromiseLike<number>(pr1);
declare const p1: Promise<number>;
const pf1 = promiseFinally(p1);
assertCoreJSPromiseLike<number>(pf1);
const pf2 = promiseFinally(p1, undefined);
assertCoreJSPromiseLike<number>(pf2);
const pf3 = promiseFinally(p1, null);
assertCoreJSPromiseLike<number>(pf3);
const pf4 = promiseFinally(p1, () => {});
assertCoreJSPromiseLike<number>(pf4);
const pf5 = promiseFinally(p1, function () {});
assertCoreJSPromiseLike<number>(pf5);

const pr2 = promiseReject('err');
assertCoreJSPromiseLike<number>(pr2);
declare const p2: Promise<never>;
const pf6 = promiseFinally(p2);
assertCoreJSPromiseLike<string>(pf6);
const pf7 = promiseFinally(p2, () => {});
assertCoreJSPromiseLike<string>(pf7);

// @ts-expect-error
promiseFinally(p1, 123);

// @ts-expect-error
promiseFinally(p1, 'foo');

// @ts-expect-error
promiseFinally(p1, {});

// @ts-expect-error
promiseFinally(p1, []);

// @ts-expect-error
promiseFinally(p1, () => {}, 'extra');

// @ts-expect-error
promiseFinally(p1, true);

// @ts-expect-error
promiseFinally(p1, Symbol('x'));
