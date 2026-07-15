// SIDE-EFFECT ordering around a KEPT proxy root (a chain-assign the collapse may not root through, because
// its value navigates a hop core-js does not ponyfill). the root re-emits itself, so it must not ALSO be
// harvested as an effect - but everything else around it must still run, exactly once, in source order.
// each line puts the effect somewhere different: inside the assigned value, in a sequence around the
// assignment, in a computed hop key, and on both sides at once. distinct methods per line.
let c = 0;

let a;
export const effectInsideValue = (a = (c++, globalThis.window)).self.Array.prototype.flat.call([1, [2]]);

let b;
export const effectAroundAssign = (c++, b = globalThis.window)?.self.Array.prototype.at.call([1], 0);

let d;
export const effectInHopKey = (d = globalThis.window)?.[(c++, 'self')].Array.prototype.includes.call([1], 1);

let e;
export const effectBothSides = (c++, e = globalThis.window)?.[(c++, 'self')].Array.prototype.findLast.call([1], x => x);

export { c };

// NEGATIVES for the tail classification. a sequence value whose tail is UNGROUNDED keeps its live guard
// and its raw value; a tail that is no proxy at all keeps the `.self` untouched too - that `.self` is a
// property of the user's own object, not a hop
let n;
export const seqWindowTail = (n = (c++, globalThis.window))?.self.Array.prototype.findIndex.call([1], x => x);

const plain = { self: { Array } };
let m;
export const seqPlainTail = (m = (c++, plain))?.self.Array.prototype.indexOf.call([1], 1);

// nested SE prefixes around a ponyfilled tail all survive, in source order, and the guard is dead
let k;
export const nestedSeqPony = (k = (c++, (c++, globalThis.self)))?.self.Array.prototype.flatMap.call([1], x => [x]);

