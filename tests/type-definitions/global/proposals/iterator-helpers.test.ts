import 'core-js/es';
import map from 'core-js/es/iterator/map';
import filter from 'core-js/es/iterator/filter';
import take from 'core-js/es/iterator/take';
import drop from 'core-js/es/iterator/drop';
import flatMap from 'core-js/es/iterator/flat-map';
import reduce from 'core-js/es/iterator/reduce';
import forEach from 'core-js/es/iterator/for-each';
import some from 'core-js/es/iterator/some';
import every from 'core-js/es/iterator/every';
import find from 'core-js/es/iterator/find';
import { assertBool, assertNumber, assertNumberArray, assertString } from '../../helpers';

declare const it: Iterator<number>;
declare const itStr: Iterator<string>;
declare const itNumStr: Iterator<number | string>;

const mappedNumNS: Iterator<number> = map(it, n => n + 1);

const mappedStr: Iterator<string> = it.map((v, i) => String(v));
const mappedNum: Iterator<number> = it.map(n => n + 1);

// @ts-expect-error
it.map();
// @ts-expect-error
it.map((v, i, extra) => v + i + extra);

const onlyEvenNS: Iterator<number> = filter(it, v => v % 2 === 0);

const onlyEven: Iterator<number> = it.filter(v => v % 2 === 0);
const filtered: Iterator<number> = it.filter((v): v is number => typeof v === 'number');

// @ts-expect-error
it.filter();
// @ts-expect-error
it.filter((v, i, extra) => true);

const takenNS: Iterator<number> = take(it, 5);

const taken: Iterator<number> = it.take(5);

// @ts-expect-error
it.take();
// @ts-expect-error
it.take('5');

const droppedNS: Iterator<number> = drop(it, 3);

const dropped: Iterator<number> = it.drop(3);

// @ts-expect-error
it.drop('3');

const flatMappedNS: Iterator<string> = flatMap(it, (v, i) => itStr);

const flatMapped: Iterator<string> = it.flatMap((v, i) => itStr);
const flatMapped2: Iterator<string> = it.flatMap((v, i) => ({
  [Symbol.iterator]: function * () {
    yield String(v);
  },
}));

// @ts-expect-error
it.flatMap();

assertNumber(reduce(it, (a, b, c) => a + b + c));

assertNumber(it.reduce((a, b, c) => a + b + c));
assertNumber(it.reduce((a, b, c) => a + b + c, 0));
assertString(it.reduce(
  (acc: string, val) => acc + val,
  '',
));

// @ts-expect-error
it.reduce();
// @ts-expect-error
it.reduce((a, b, c, d) => a);

assertNumberArray(it.toArray());

forEach(it, (value, idx) => {
  const x: number = value;
  const y: number = idx;
});

it.forEach((value, idx) => {
  const x: number = value;
  const y: number = idx;
});

// @ts-expect-error
it.forEach();

assertBool(some(it, (v, i) => v > 0));
assertBool(it.some((v, i) => v > 0));

// @ts-expect-error
it.some();
// @ts-expect-error
it.some((v, i, extra) => true);

assertBool(every(it, (v, i) => v > 0));
assertBool(it.every((v, i) => v > 0));

// @ts-expect-error
it.every();
// @ts-expect-error
it.every((v, i, extra) => true);

const found1NS: number | undefined = find(it, (v, i) => v > 5);

const found1: number | undefined = it.find((v, i) => v > 5);
const findString: string | number | undefined = itNumStr.find((v): v is string => typeof v === 'string');

// @ts-expect-error
it.find();
