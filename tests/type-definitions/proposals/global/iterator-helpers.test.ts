import 'core-js/full';

declare const it: Iterator<number>;
declare const itStr: Iterator<string>;
declare const itNumStr: Iterator<number | string>;

const mappedStr: Iterator<string> = it.map((v, i) => String(v));
const mappedNum: Iterator<number> = it.map(n => n + 1);

// @ts-expect-error
it.map();
// @ts-expect-error
it.map((v, i, extra) => v + i + extra);

const onlyEven: Iterator<number> = it.filter(v => v % 2 === 0);
const filtered: Iterator<number> = it.filter((v): v is number => typeof v === 'number');

// @ts-expect-error
it.filter();
// @ts-expect-error
it.filter((v, i, extra) => true);

const taken: Iterator<number> = it.take(5);

// @ts-expect-error
it.take();
// @ts-expect-error
it.take('5');

const dropped: Iterator<number> = it.drop(3);

// @ts-expect-error
it.drop('3');

const flatMapped: Iterator<string> = it.flatMap((v, i) => itStr);
const flatMapped2: Iterator<string> = it.flatMap((v, i) => ({
  [Symbol.iterator]: function* () {
    yield String(v);
  }
}));

// @ts-expect-error
it.flatMap();

const sum1: number = it.reduce((a, b, c) => a + b + c);
const sum2: number = it.reduce((a, b, c) => a + b + c, 0);
const strReduce: string = it.reduce(
  (acc: string, val) => acc + val,
  ''
);

// @ts-expect-error
it.reduce();
// @ts-expect-error
it.reduce((a, b, c, d) => a);

const arr: number[] = it.toArray();

it.forEach((value, idx) => {
  const x: number = value;
  const y: number = idx;
});

// @ts-expect-error
it.forEach();

const hasPositive: boolean = it.some((v, i) => v > 0);

// @ts-expect-error
it.some();
// @ts-expect-error
it.some((v, i, extra) => true);

const allPositive: boolean = it.every((v, i) => v > 0);

// @ts-expect-error
it.every();
// @ts-expect-error
it.every((v, i, extra) => true);

const found1: number | undefined = it.find((v, i) => v > 5);
const findString: string | undefined = itNumStr.find((v): v is string => typeof v === 'string');

// @ts-expect-error
it.find();
