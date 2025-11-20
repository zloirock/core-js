import 'core-js/full';

declare const its1: Iterable<string>;
declare const arrs: string[];
declare const arrn: number[];
declare const arrb: boolean[];
declare const itb1: Iterable<boolean>;

const ri1: Iterator<number | string> = Iterator.concat(its1);
const ri2: Iterator<number | string> = Iterator.concat(arrs);
const ri3: Iterator<number> = Iterator.concat(arrn);
const ri4: Iterator<number | boolean> = Iterator.concat(arrb, itb1);
const ri5: Iterator<number> = Iterator.concat();

// @ts-expect-error
Iterator.concat(1);
// @ts-expect-error
Iterator.concat(true);
// @ts-expect-error
Iterator.concat({});
