import $Set from '@core-js/pure/full/set';
import setUnion from '@core-js/pure/full/set/union';
import setIntersection from '@core-js/pure/full/set/intersection';
import setDifference from '@core-js/pure/full/set/difference';
import setSymmetricDifference from '@core-js/pure/full/set/symmetric-difference';
import setIsSubsetOf from '@core-js/pure/full/set/is-subset-of';
import setIsSupersetOf from '@core-js/pure/full/set/is-superset-of';
import setIsDisjointFrom from '@core-js/pure/full/set/is-disjoint-from';
import { assertCoreJSSetLike } from '../../helpers';

const setA = new $Set<number>([1, 2, 3]);
const setB = new $Set<string>(['a', 'b', 'c']);

const setLike = {
  keys() { return [1, 2, 3][Symbol.iterator](); },
  has(val: number): boolean { return val === 2; },
  size: 3,
};

const setLikeStr = {
  keys() { return ['a', 'b'][Symbol.iterator](); },
  has(val: string): boolean { return val === 'a'; },
  size: 2,
};

const unionAB = setUnion(setA, setB);
assertCoreJSSetLike<number | string>(unionAB);
const unionAL = setUnion(setA, setLike);
assertCoreJSSetLike<number>(unionAL);
const unionALS = setUnion(setA, setLikeStr);
assertCoreJSSetLike<number | string>(unionALS);

const interAB = setIntersection(setA, setB);
assertCoreJSSetLike<number>(interAB);
const interAN = setIntersection(setA, setLike);
assertCoreJSSetLike<number>(interAN);
const intersectionALS = setIntersection(setA, setLikeStr);
assertCoreJSSetLike<number>(intersectionALS);

const diffAB = setDifference(setA, setB);
assertCoreJSSetLike<number>(diffAB);
const diffAN = setDifference(setA, setLike);
assertCoreJSSetLike<number>(diffAN);
const diffALS = setDifference(setA, setLikeStr);
assertCoreJSSetLike<number>(diffALS);

const symdiffAB = setSymmetricDifference(setA, setB);
assertCoreJSSetLike<number | string>(symdiffAB);
const symdiffAL = setSymmetricDifference(setA, setLike);
assertCoreJSSetLike<number>(symdiffAL);

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
