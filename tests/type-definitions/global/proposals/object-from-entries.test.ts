import 'core-js/full';

declare const objEntries: Iterable<readonly [PropertyKey, number]>;
declare const mixedEntries: Iterable<readonly any[]>;
declare const wrongEntries1: Iterable<number>;
declare const wrongEntries2: number;
declare const notIterable: {};

const r1: { [k: string]: number } = Object.fromEntries(objEntries);
const r2: any = Object.fromEntries(mixedEntries);
const r3: any = Object.fromEntries([['a', 1], ['b', 2]]);
const r4: object = Object.fromEntries(new Map<PropertyKey, number>([ ['x', 1], ['y', 2] ]));

// @ts-expect-error
Object.fromEntries();

// @ts-expect-error
Object.fromEntries(123);

// @ts-expect-error
Object.fromEntries(wrongEntries1);

// @ts-expect-error
Object.fromEntries(wrongEntries2);

// @ts-expect-error
Object.fromEntries(notIterable);
