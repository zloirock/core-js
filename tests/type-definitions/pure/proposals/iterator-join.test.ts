import iteratorJoin from '@core-js/pure/full/iterator/join';

declare const it: Iterator<number>;

const res1: string = iteratorJoin(it);
const res2: string = iteratorJoin(it, ' ');
const res3: string = iteratorJoin(it, undefined);

// @ts-expect-error
iteratorJoin(it, 5);
// @ts-expect-error
iteratorJoin(it, Symbol('x'));
// @ts-expect-error
iteratorJoin(it, null);
// @ts-expect-error
iteratorJoin(it, '+', '_');
// @ts-expect-error
const res7: number = iteratorJoin(it);
