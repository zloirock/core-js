// An assignment under an array wrapper reads each claimed element once: the wrapper captures it and
// the method dispatches on the capture, whatever leads the element - a realm navigation, a dead `?.`
// over the realm, a kept write. A leaf off a constructor the hops merely reach is a name match only.
const log = [];
let flat, at, deep, kept, kw, named, keyed, other, stat, zn;
// A sole wrapper assigns its captured method after the native array step.
[{ flat }] = [globalThis.Array.prototype];
// A neighbouring element binds after the first captured method read.
[{ at }, zn] = [globalThis.Array.prototype, 7];
// a marked nav resolves like the plain one
[{ findLast: deep }] = [globalThis?.globalThis.Array.prototype];
// a kept WRITE as the element: the store is a prefix of its own, and the nav reads what it stored
[{ Array: { prototype: { copyWithin: kept } } }] = [(kw = globalThis)];
// NEGATIVE: a leaf off the object the hops merely REACH is a name match, not a surface claim
[{ Array: { keys: named } }] = [globalThis];
// ... and a dead `?.` over the realm changes nothing about that
let markedName;
[{ Array: { keys: markedName } }] = [globalThis?.globalThis];
// A computed key runs before its method read; the captured receiver also serves the sibling.
[{ [(log.push("k"), "flatMap")]: keyed, other }] = [Array.prototype];
// a static under a wrapper with a neighbour is served by a literal in its slot: the pattern stays
// whole for the neighbour that still binds
[{ of: stat }, zn] = [Array, 7];
export { flat, at, deep, kept, kw, named, markedName, keyed, other, stat, zn, log };
