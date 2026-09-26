import iteratorJoin from '@core-js/pure/full/iterator/join';

declare const it: Iterator<number>;

const res1: string = iteratorJoin(it);
const res2: string = iteratorJoin(it, ' ');
const res3: string = iteratorJoin(it, 5);
const res4: string = iteratorJoin(it, Symbol('x'));
const res5: string = iteratorJoin(it, undefined);
const res6: string = iteratorJoin(it, null);

// @ts-expect-error
iteratorJoin(it, '+', '_');
// @ts-expect-error
const res7: number = iteratorJoin(it);
