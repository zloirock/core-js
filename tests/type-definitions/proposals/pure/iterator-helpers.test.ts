import iteratorMap from '@core-js/pure/full/iterator/map';
import iteratorFilter from '@core-js/pure/full/iterator/filter';
import iteratorTake from '@core-js/pure/full/iterator/take';
import iteratorDrop from '@core-js/pure/full/iterator/drop';
import iteratorFlatMap from '@core-js/pure/full/iterator/flat-map';
import iteratorReduce from '@core-js/pure/full/iterator/reduce';
import iteratorToArray from '@core-js/pure/full/iterator/to-array';
import iteratorForEach from '@core-js/pure/full/iterator/for-each';
import iteratorSome from '@core-js/pure/full/iterator/some';
import iteratorEvery from '@core-js/pure/full/iterator/every';
import iteratorFind from '@core-js/pure/full/iterator/find';

declare const it: Iterator<number>;
declare const itStr: Iterator<string>;
declare const itNumStr: Iterator<number | string>;

const res: Iterator<string> = iteratorMap(it, (v, i) => String(v));
const mappedNum: Iterator<number> = iteratorMap(it, n => n + 1);

// @ts-expect-error
iteratorMap();
// @ts-expect-error
iteratorMap((v, i, extra) => v + i + extra);

const onlyEven: Iterator<number> = iteratorFilter(it, v => v % 2 === 0);
const filtered: Iterator<number> = iteratorFilter(it, (v): v is number => typeof v === 'number');

// @ts-expect-error
iteratorFilter();
// @ts-expect-error
iteratorFilter((v, i, extra) => true);

const taken: Iterator<number> = iteratorTake(it, 5);

// @ts-expect-error
iteratorTake();
// @ts-expect-error
iteratorTake('5');

const dropped: Iterator<number> = iteratorDrop(it, 3);

// @ts-expect-error
iteratorDrop('3');

const flatMapped: Iterator<string> = iteratorFlatMap(it, (v, i) => itStr);
const flatMapped2: Iterator<string> = iteratorFlatMap(it, (v, i) => ({
  [Symbol.iterator]: function* () {
    yield String(v);
  }
}));

// @ts-expect-error
iteratorFlatMap();

const sum1: number = iteratorReduce(it, (a, b, c) => a + b + c, 0);
const sum2: number = iteratorReduce(it, (a, b, c) => a + b + c, 0);
const strReduce: string = iteratorReduce(
  it,
  (acc: string, val) => acc + val,
  ''
);

// @ts-expect-error
iteratorReduce();
// @ts-expect-error
iteratorReduce(it, (a, b, c, d) => a);

const arr: number[] = iteratorToArray(it);

iteratorForEach(it, (value, idx) => {
  const x: number = value;
  const y: number = idx;
});

// @ts-expect-error
iteratorForEach(it);

const hasPositive: boolean = iteratorSome(it, (v, i) => v > 0);

// @ts-expect-error
iteratorSome(it);
// @ts-expect-error
iteratorSome(it, (v, i, extra) => true);

const allPositive: boolean = iteratorEvery(it, (v, i) => v > 0);

// @ts-expect-error
iteratorEvery(it);
// @ts-expect-error
iteratorEvery(it, (v, i, extra) => true);

const found1: number | undefined = iteratorFind(it, (v, i) => v > 5);
// const findString: string | undefined = iteratorFind(itNumStr, (v): v is string => typeof v === 'string');
iteratorFind(itNumStr, (v): v is string => typeof v === 'string');

// @ts-expect-error
iteratorFind(it);
