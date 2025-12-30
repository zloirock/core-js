import iteratorConcat from '@core-js/pure/full/iterator/concat';

declare const its1: Iterable<string>;
declare const arrs: string[];
declare const arrn: number[];
declare const arrb: boolean[];
declare const itb1: Iterable<boolean>;

const ri1: Iterator<number | string> = iteratorConcat(its1);
const ri2: Iterator<number | string> = iteratorConcat(arrs);
const ri3: Iterator<number> = iteratorConcat(arrn);
const ri4: Iterator<number | boolean> = iteratorConcat(arrb, itb1);
const ri5: Iterator<number> = iteratorConcat();

// @ts-expect-error
iteratorConcat(1);
// @ts-expect-error
iteratorConcat(true);
// @ts-expect-error
iteratorConcat({});
