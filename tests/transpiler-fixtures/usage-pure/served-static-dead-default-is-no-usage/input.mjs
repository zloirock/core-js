// A default on a static the build serves never runs: pure drops it with the rewrite, off the constructor,
// an alias of it and in an assignment, and keeps it as written inside a realm key's mirror - nothing it
// reads imports. A receiver selecting a constructor without the static may run it, and what it reads imports.
const A = Array;
const { from = [].flat() } = Array;
const { of = [].findLast(Boolean) } = A;
const { Object: { entries = [].toReversed() } } = globalThis;
let hasOwn;
({ hasOwn = [].toSorted() } = Object);
const { groupBy = [].with(0, 1) } = flag ? Map : WeakMap;
export { from, of, entries, hasOwn, groupBy };
