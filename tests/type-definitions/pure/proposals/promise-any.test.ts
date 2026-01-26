import promiseAny from '@core-js/pure/full/promise/any';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { assertCoreJSPromiseLike } from '../../helpers';

const arr = [promiseResolve(1), promiseResolve('foo'), 3] as const;
const justNumbers = [1, 2, 3];
const setOfStrings = new Set(['a', 'b', 'c']);
const promiseLike = { then: (cb: (val: number) => void) => cb(123) };
const emptyTuple: [] = [];
const mixed = [true, promiseResolve('z')] as const;

const any1 = promiseAny(arr);
assertCoreJSPromiseLike<string | number>(any1);
const any2 = promiseAny(['x', 'y', promiseResolve(5)]);
assertCoreJSPromiseLike<string | number>(any2);
const any3 = promiseAny(emptyTuple);
assertCoreJSPromiseLike<never>(any3);
const any4 = promiseAny(mixed);
assertCoreJSPromiseLike<boolean | string>(any4);

const any5 = promiseAny(justNumbers);
assertCoreJSPromiseLike<number>(any5);
const any6 = promiseAny(setOfStrings);
assertCoreJSPromiseLike<string>(any6);
const any7 = promiseAny([promiseLike]);
assertCoreJSPromiseLike<number>(any7);
const any8 = promiseAny(new Set([1]));
assertCoreJSPromiseLike<number>(any8);
const any9 = promiseAny([promiseResolve()]);
assertCoreJSPromiseLike<unknown>(any9);

// @ts-expect-error
promiseAny();

// @ts-expect-error
promiseAny(123);

// @ts-expect-error
promiseAny({ foo: 42 });

// @ts-expect-error
promiseAny([1, 2], 3);

// @ts-expect-error
promiseAny(justNumbers, 'extra');
