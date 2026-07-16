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

// the UNGUARDED twin of the SE-bearing hop key: no guard, so the key evaluates right after the assignment
// in the native order - the migrated key preserves exactly that (assignment, key effect, read), where a
// pre-root harvest would have run the effect before the assignment
let u;
export const unguardedSeKey = (u = globalThis.window)[(c++, 'self')].Array.prototype.flatMap.call([2], x => [x]);

// a COMPUTED leaf after the migrated hop: the splice resumes after the leaf's own closing bracket -
// slicing from the key's end left a stray `]` in the output (a parse break)
let x;
export const computedLeafAfterSeKey = (x = globalThis.window)?.[(c++, 'self')]['Array'].prototype.every.call([1], v => v);

// a polyfillable call INSIDE the migrated key: its own rewrite must compose into the moved text
let y;
export const polyfillInsideMovedKey = (y = globalThis.window)?.[([c].flat(), 'self')].Array.prototype.some.call([1], v => v);

// an ALIAS-carried kept root: the alias identifier is already rewritten by its declaration, and the
// migrated key composes over it exactly like over the direct spelling
const alias = globalThis;
let z;
export const aliasKeptSeKey = (z = alias.window)?.[(c++, 'self')].Array.prototype.findLastIndex.call([1], v => v);
// an effect in the VALUE and another in the KEY of the same access: the value's stays inside the
// assignment, the key's rides the migrated key - two channels, native order for each
let sv;
export const seqValueAndKey = (sv = (c++, globalThis.window))?.[(c++, 'self')].Array.prototype.map.call([1], v => v);

// two SE keys on one UNGUARDED kept root: both migrate into the surviving key, in source order
let ud;
export const unguardedDoubleKey = (ud = globalThis.window)[(c++, 'self')][(c++, 'self')].Array.of(5);
