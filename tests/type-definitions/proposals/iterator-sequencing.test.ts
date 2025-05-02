import 'core-js/full';

declare const itn1: Iterator<number>;
declare const its1: Iterable<string>;
declare const arrs: string[];
declare const arrn: number[];
declare const arrb: boolean[];
declare const itb1: Iterable<boolean>;

const ri1: Iterator<number | string> = itn1.concat(its1);
const ri2: Iterator<number | string> = itn1.concat(arrs);
const ri3: Iterator<number> = itn1.concat(arrn);
const ri4: Iterator<number | boolean> = itn1.concat(arrb, itb1);
const ri5: Iterator<number> = itn1.concat();

// @ts-expect-error
itn.concat(1);
// @ts-expect-error
itn.concat(true);
// @ts-expect-error
itn.concat({});
// @ts-expect-error
itn.concat(null);
// @ts-expect-error
itn.concat(undefined);
