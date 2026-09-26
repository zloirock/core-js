// An assignment under an array wrapper reads the paired element once. A flat method claim
// needs no object hop, while an optional hop still short-circuits as the source wrote it.
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
// ... and the `?.` buys it no route around that rule: the hop short-circuits the whole chain, so the
// question the marked nav answers is the plain one's
let markedName;
[{ Array: { keys: markedName } }] = [globalThis?.globalThis];
// A computed key runs before its method read; the captured receiver also serves the sibling.
[{ [(log.push("k"), "flatMap")]: keyed, other }] = [Array.prototype];
// ... and a FLAT static under a multi wrapper is claimed like the instance one above it: the
// OVERWRITE channel owns the shape, so the destructure stays whole for the sibling that still binds
// and the ponyfill is written after it. Left to the cascade rebuild - which never descends a
// multi-element wrapper - the slot read its static off the raw element instead
[{ of: stat }, zn] = [Array, 7];
export { flat, at, deep, kept, kw, named, markedName, keyed, other, stat, zn, log };
