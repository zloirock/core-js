import promiseTry from '@core-js/pure/full/promise/try';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { assertCoreJSPromiseLike } from '../../helpers';

const pt1 = promiseTry(() => 42);
assertCoreJSPromiseLike<number>(pt1);
const pt2 = promiseTry(() => promiseResolve('hi'));
assertCoreJSPromiseLike<string>(pt2);
const pt3 = promiseTry((a: number, b: number) => a + b, 1, 2);
assertCoreJSPromiseLike<number>(pt3);
const pt4 = promiseTry((x: string) => x + '!!', 'test');
assertCoreJSPromiseLike<string>(pt4);
const pt5 = promiseTry(() => {});
assertCoreJSPromiseLike<void>(pt5);
const pt6 = promiseTry((b: boolean) => b, false);
assertCoreJSPromiseLike<boolean>(pt6);

const pt7 = promiseTry((a: number, b: string, c: boolean) => c ? a : Number(b), 10, '100', true);
assertCoreJSPromiseLike<number>(pt7);
const pt8 = promiseTry((a: string) => promiseResolve(a), 'bar');
assertCoreJSPromiseLike<string>(pt8);

const pt9 = promiseTry(() => pt1);
assertCoreJSPromiseLike<number>(pt9);

// @ts-expect-error
promiseTry();

// @ts-expect-error
promiseTry(42);

// @ts-expect-error
promiseTry('callback');

// @ts-expect-error
promiseTry({});

// @ts-expect-error
promiseTry([]);

// @ts-expect-error
promiseTry(() => 1, 2, 'a', Symbol('x'));

// @ts-expect-error
promiseTry((a: boolean) => a, 123);
