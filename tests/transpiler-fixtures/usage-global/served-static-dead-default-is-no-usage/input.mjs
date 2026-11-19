// A default on a static the build serves never runs, so like the dead part of a decided selection it is no
// usage: off the constructor, an alias of it, a realm key and in an assignment alike, nothing it reads
// loads. A receiver selecting a constructor without the static may run it, and what it reads loads.
const A = Array;
const { from = [].flat() } = Array;
const { of = [].findLast(Boolean) } = A;
const { Object: { entries = [].toReversed() } } = globalThis;
let hasOwn;
({ hasOwn = [].toSorted() } = Object);
const { groupBy = [].with(0, 1) } = flag ? Map : WeakMap;
export { from, of, entries, hasOwn, groupBy };
