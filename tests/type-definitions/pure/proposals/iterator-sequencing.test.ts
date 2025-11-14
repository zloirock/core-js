import concat from '@core-js/pure/full/iterator/concat';

declare const its1: Iterable<string>;
declare const arrs: string[];
declare const arrn: number[];
declare const arrb: boolean[];
declare const itb1: Iterable<boolean>;

const ri1: Iterator<number | string> = concat(its1);
const ri2: Iterator<number | string> = concat(arrs);
const ri3: Iterator<number> = concat(arrn);
const ri4: Iterator<number | boolean> = concat(arrb, itb1);
const ri5: Iterator<number> = concat();

// @ts-expect-error
concat(1);
// @ts-expect-error
concat(true);
// @ts-expect-error
concat({});
