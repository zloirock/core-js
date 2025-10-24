import setUnion from '@core-js/pure/full/set/union';
import setIntersection from '@core-js/pure/full/set/intersection';
import setDifference from '@core-js/pure/full/set/difference';
import setSymmetricDifference from '@core-js/pure/full/set/symmetric-difference';
import setIsSubsetOf from '@core-js/pure/full/set/is-subset-of';
import setIsSupersetOf from '@core-js/pure/full/set/is-superset-of';
import setIsDisjointFrom from '@core-js/pure/full/set/is-disjoint-from';

const setA = new Set<number>([1, 2, 3]);
const setB = new Set<string>(['a', 'b', 'c']);

const setLike: ReadonlySetLike<number> = {
  keys() { return [1, 2, 3][Symbol.iterator](); },
  has(val: number): boolean { return val === 2; },
  size: 3
};

const setLikeStr: ReadonlySetLike<string> = {
  keys() { return ['a', 'b'][Symbol.iterator](); },
  has(val: string): boolean { return val === 'a'; },
  size: 2
};

const unionAB: Set<number | string> = setUnion(setA, setB);
const unionAL: Set<number | string> = setUnion(setA, setLike);
const unionALS: Set<number | string> = setUnion(setA, setLikeStr);

const interAB: Set<number> = setIntersection(setA, setB);
const interAN: Set<number> = setIntersection(setA, setLike);
const interALS: Set<number> = setIntersection(setA, setLikeStr);

const diffAB: Set<number> = setDifference(setA, setB);
const diffAN: Set<number> = setDifference(setA, setLike);
const diffALS: Set<number> = setDifference(setA, setLikeStr);

const symdiffAB: Set<number | string> = setSymmetricDifference(setA, setB);
const symdiffAL: Set<number> = setSymmetricDifference(setA, setLike);

const sub: boolean = setIsSubsetOf(setA, setLikeStr);
const superSet: boolean = setIsSupersetOf(setA, setLikeStr);
const isDisjoint: boolean = setIsDisjointFrom(setA, setLike);

// @ts-expect-error
setUnion(setA);
// @ts-expect-error
setUnion(setA, 123);
// @ts-expect-error
setUnion(setA, {});

// @ts-expect-error
setIntersection(setA);
// @ts-expect-error
setIntersection(setA, 'a');
// @ts-expect-error
setIntersection(setA, { foo: 'bar' });

// @ts-expect-error
setDifference(setA);
// @ts-expect-error
setDifference(setA, []);

// @ts-expect-error
setSymmetricDifference(setA);
// @ts-expect-error
setSymmetricDifference(setA, 1);

// @ts-expect-error
setIsSubsetOf(setA);
// @ts-expect-error
setIsSubsetOf(setA, []);

// @ts-expect-error
setIsSupersetOf(setA);
// @ts-expect-error
setIsDisjointFrom(setA);
