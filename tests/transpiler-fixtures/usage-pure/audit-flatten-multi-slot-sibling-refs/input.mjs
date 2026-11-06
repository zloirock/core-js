// the flatten's per-slot rewrite hint keeps a nested substitution's occurrence count aligned
// with the rebuilt text: TWO consumed receiver slots drop two source occurrences of the name
// before the verbatim sibling, whose own references (several in one initializer) must each
// land on their own occurrence - a drifted ordinal would rename a later occurrence instead
const { Array: { from } } = globalThis, { Map: { groupBy } } = globalThis, keep = [globalThis, globalThis.x];
export { from, groupBy, keep };
let c = 0;
const { Array: { of } } = (c++, globalThis), tail = [globalThis];
export { of, tail };
