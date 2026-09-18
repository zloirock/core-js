// an assignment host under an array WRAPPER claims what the statement host claims: the element the
// pattern is paired with IS the receiver, so a FLAT claim has one even with no hop chain to resolve,
// and a `?.` the source wrote is a nav all the same - the hop short-circuits the whole chain, so the
// residual and the dispatch read one value
const log = [];
let flat, at, deep, kept, kw, named, keyed, other, stat, zn;
// the SOLE wrapper: the consumed slot leaves and the dispatch takes the statement
[{ flat }] = [globalThis.Array.prototype];
// ... a MULTI one keeps the destructure - its neighbour still binds - and appends the dispatch
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
// ... and a FLAT SE-keyed prop over a MEMBER read SHARES that read rather than repeating it: the
// memo takes the element's own slot, so the member is evaluated where and as often as the source
// evaluates it, the residual reads the memo in its place, and the dispatch reads it again for free
[{ [(log.push("k"), "flatMap")]: keyed, other }] = [Array.prototype];
// ... and a FLAT static under a multi wrapper is claimed like the instance one above it: the
// OVERWRITE channel owns the shape, so the destructure stays whole for the sibling that still binds
// and the ponyfill is written after it. Left to the cascade rebuild - which never descends a
// multi-element wrapper - the slot read its static off the raw element instead
[{ of: stat }, zn] = [Array, 7];
export { flat, at, deep, kept, kw, named, markedName, keyed, other, stat, zn, log };
