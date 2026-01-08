import $Set from '@core-js/pure/full/set';
import setUnion from '@core-js/pure/full/set/union';
import setIntersection from '@core-js/pure/full/set/intersection';
import setDifference from '@core-js/pure/full/set/difference';
import setSymmetricDifference from '@core-js/pure/full/set/symmetric-difference';
import setIsSubsetOf from '@core-js/pure/full/set/is-subset-of';
import setIsSupersetOf from '@core-js/pure/full/set/is-superset-of';
import setIsDisjointFrom from '@core-js/pure/full/set/is-disjoint-from';
import { CoreJSSetAndSetLike } from '../../helpers';

const setA = new $Set<number>([1, 2, 3]);
const setB = new $Set<string>(['a', 'b', 'c']);

const setLike = {
  keys() { return [1, 2, 3][Symbol.iterator](); },
  has(val: number): boolean { return val === 2; },
  size: 3
};

const setLikeStr = {
  keys() { return ['a', 'b'][Symbol.iterator](); },
  has(val: string): boolean { return val === 'a'; },
  size: 2
};

const unionAB: CoreJSSetAndSetLike<number | string> = setUnion(setA, setB);
const unionAL: CoreJSSetAndSetLike<number | string> = setUnion(setA, setLike);
const unionALS: CoreJSSetAndSetLike<number | string> = setUnion(setA, setLikeStr);

const interAB: CoreJSSetAndSetLike<number> = setIntersection(setA, setB);
const interAN: CoreJSSetAndSetLike<number> = setIntersection(setA, setLike);
const intersectionALS: CoreJSSetAndSetLike<number> = setIntersection(setA, setLikeStr);

const diffAB: CoreJSSetAndSetLike<number> = setDifference(setA, setB);
const diffAN: CoreJSSetAndSetLike<number> = setDifference(setA, setLike);
const diffALS: CoreJSSetAndSetLike<number> = setDifference(setA, setLikeStr);

const symdiffAB: CoreJSSetAndSetLike<number | string> = setSymmetricDifference(setA, setB);
const symdiffAL: CoreJSSetAndSetLike<number> = setSymmetricDifference(setA, setLike);

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
