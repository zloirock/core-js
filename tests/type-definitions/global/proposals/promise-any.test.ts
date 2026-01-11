import 'core-js/full';

const arr = [Promise.resolve(1), Promise.resolve('foo'), 3] as const;
const justNumbers = [1, 2, 3];
const setOfStrings = new Set(['a', 'b', 'c']);
const promiseLike = { then: (cb: (val: number) => void) => cb(123) };
const emptyTuple: [] = [];
const mixed = [true, Promise.resolve('z')] as const;

const any1: Promise<string | number> = Promise.any(arr);
const any2: Promise<string | number> = Promise.any(['x', 'y', Promise.resolve(5)]);
const any3: Promise<never> = Promise.any(emptyTuple);
const any4: Promise<boolean | string> = Promise.any(mixed);

const any5: Promise<number> = Promise.any(justNumbers);
const any6: Promise<string> = Promise.any(setOfStrings);
const any7: Promise<number> = Promise.any([promiseLike]);
const any8: Promise<number> = Promise.any(new Set([1]));
const any9: Promise<unknown> = Promise.any([Promise.resolve()]);

// @ts-expect-error
Promise.any();

// @ts-expect-error
Promise.any(123);

// @ts-expect-error
Promise.any({ foo: 42 });

// @ts-expect-error
Promise.any([1, 2], 3);

// @ts-expect-error
Promise.any(justNumbers, 'extra');
