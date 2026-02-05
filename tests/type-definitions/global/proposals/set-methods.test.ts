import 'core-js/es';
import setUnion from 'core-js/es/set/union';
import setIntersection from 'core-js/es/set/intersection';
import setDifference from 'core-js/es/set/difference';
import setSymmetricDifference from 'core-js/es/set/symmetric-difference';
import setIsSubsetOf from 'core-js/es/set/is-subset-of';
import setIsSupersetOf from 'core-js/es/set/is-superset-of';
import setIsDisjointFrom from 'core-js/es/set/is-disjoint-from';

const setA = new Set<number>([1, 2, 3]);
const setB = new Set<string>(['a', 'b', 'c']);

const setLike: ReadonlySetLike<number> = {
  keys() { return [1, 2, 3][Symbol.iterator](); },
  has(val: number): boolean { return val === 2; },
  size: 3,
};

const setLikeStr: ReadonlySetLike<string> = {
  keys() { return ['a', 'b'][Symbol.iterator](); },
  has(val: string): boolean { return val === 'a'; },
  size: 2,
};

const arrSet: ReadonlySet<number> = new Set([4, 5, 6]);

const unionABNS: Set<number | string> = setUnion(setA, setB);

const unionAB: Set<number | string> = setA.union(setB);
const unionAN: Set<number> = setA.union(setLike);

const interABNS: Set<number> = setIntersection(setA, setLike);

const interAB: Set<number & string> = setA.intersection(setB);
const interAN: Set<number> = setA.intersection(setLike);

const diffABNS: Set<number> = setDifference(setA, setB);

const diffAB: Set<number> = setA.difference(setB);
const diffAN: Set<number> = setA.difference(setLike);

const symdiffALNS: Set<number> = setSymmetricDifference(setA, setLike);

const symdiffAB: Set<number | string> = setA.symmetricDifference(setB);
const symdiffAL: Set<number> = setA.symmetricDifference(setLike);

const subNS: boolean = setIsSubsetOf(setA, setLikeStr);
const sub: boolean = setA.isSubsetOf(setLikeStr);

const superSetNS: boolean = setIsSupersetOf(setA, setLikeStr);
const superSet: boolean = setA.isSupersetOf(setLikeStr);

const isDisjointNS: boolean = setIsDisjointFrom(setA, setLike);
const isDisjoint: boolean = setA.isDisjointFrom(setLike);

const unionR: Set<number> = arrSet.union(setLike);
const intersectionR: Set<number> = arrSet.intersection(setLike);
const diffR: Set<number> = arrSet.difference(setLike);
const symdiffR: Set<number> = arrSet.symmetricDifference(setLike);

const subR: boolean = arrSet.isSubsetOf(setLikeStr);
const supR: boolean = arrSet.isSupersetOf(setLikeStr);
const disjR: boolean = arrSet.isDisjointFrom(setLike);

const numStrUnion: Set<number | string> = setA.union(setLikeStr);
const numStrInter: Set<number> = setA.intersection(setLikeStr);
const numStrSym: Set<number | string> = setA.symmetricDifference(setLikeStr);

// @ts-expect-error
setA.union();
// @ts-expect-error
setA.union(123);
// @ts-expect-error
setA.union({});

// @ts-expect-error
setA.intersection();
// @ts-expect-error
setA.intersection('a');
// @ts-expect-error
setA.intersection({ foo: 'bar' });

// @ts-expect-error
setA.difference();
// @ts-expect-error
setA.difference([]);

// @ts-expect-error
setA.symmetricDifference();
// @ts-expect-error
setA.symmetricDifference(1);

// @ts-expect-error
setA.isSubsetOf();
// @ts-expect-error
setA.isSubsetOf([]);

// @ts-expect-error
setA.isSupersetOf();
// @ts-expect-error
setA.isDisjointFrom();

// @ts-expect-error
arrSet.union();
// @ts-expect-error
arrSet.union('a');

// @ts-expect-error
arrSet.intersection({});

// @ts-expect-error
arrSet.difference({});

// @ts-expect-error
arrSet.symmetricDifference({});

// @ts-expect-error
arrSet.isSubsetOf(1);
