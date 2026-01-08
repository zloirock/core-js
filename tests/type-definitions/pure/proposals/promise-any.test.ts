import promiseAny from '@core-js/pure/full/promise/any';
import promiseResolve from '@core-js/pure/full/promise/resolve';
import { AnyPromiseLike } from '../../helpers';

const arr = [promiseResolve(1), promiseResolve("foo"), 3] as const;
const justNumbers = [1, 2, 3];
const setOfStrings = new Set(["a", "b", "c"]);
const promiseLike = { then: (cb: (val: number) => void) => cb(123) };
const emptyTuple: [] = [];
const mixed = [true, promiseResolve("z")] as const;

const any1: AnyPromiseLike<string | number> = promiseAny(arr);
const any2: AnyPromiseLike<string | number> = promiseAny(["x", "y", promiseResolve(5)]);
const any3: AnyPromiseLike<never> = promiseAny(emptyTuple);
const any4: AnyPromiseLike<boolean | string> = promiseAny(mixed);

const any5: AnyPromiseLike<number> = promiseAny(justNumbers);
const any6: AnyPromiseLike<string> = promiseAny(setOfStrings);
const any7: AnyPromiseLike<number> = promiseAny([promiseLike]);
const any8: AnyPromiseLike<number> = promiseAny(new Set([1]));
const any9: AnyPromiseLike<unknown> = promiseAny([promiseResolve()]);

// @ts-expect-error
promiseAny();

// @ts-expect-error
promiseAny(123);

// @ts-expect-error
promiseAny({ foo: 42 });

// @ts-expect-error
promiseAny([1, 2], 3);

// @ts-expect-error
promiseAny(justNumbers, "extra");
