import objectFromEntries from '@core-js/pure/full/object/from-entries';

declare const objEntries: Iterable<readonly [PropertyKey, number]>;
declare const mixedEntries: Iterable<readonly any[]>;
declare const wrongEntries1: Iterable<number>;
declare const wrongEntries2: number;
declare const notIterable: {};

const r1: { [k: string]: number } = objectFromEntries(objEntries);
const r2: any = objectFromEntries(mixedEntries);
const r3: any = objectFromEntries([['a', 1], ['b', 2]]);
const r4: object = objectFromEntries(new Map<PropertyKey, number>([ ['x', 1], ['y', 2] ]));

// @ts-expect-error
objectFromEntries();

// @ts-expect-error
objectFromEntries(123);

// @ts-expect-error
objectFromEntries(wrongEntries1);

// @ts-expect-error
objectFromEntries(wrongEntries2);

// @ts-expect-error
objectFromEntries(notIterable);
