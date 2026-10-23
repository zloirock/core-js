import iteratorIncludes from '@core-js/pure/full/iterator/includes';

declare const it: Iterator<number>;

const res1: boolean = iteratorIncludes(it, 1);
const res2: boolean = iteratorIncludes(it, 1, 2);

// @ts-expect-error
iteratorIncludes(it);
// @ts-expect-error
iteratorIncludes(it, '1');
// @ts-expect-error
iteratorIncludes(it, 1, '1');
// @ts-expect-error
const res3: number = iteratorIncludes(it, 1);
