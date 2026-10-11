// a whole-CTOR slot replacement read through the realm stays on the live slot - a nested hop, a parameter
// default's mirror (its untouched sibling still extracted), a const alias of the realm, an assignment or an
// effect-prefixed destructure, the sibling of a symbol-iterator extraction - and a local the hop binds
// reads as that local
globalThis.Promise = function ShimPromise() {};
globalThis.Set = function ShimSet() {};
const { self: { Promise } } = globalThis;
export const p = Promise;
function read({ Array: { from }, Set } = globalThis) { return [from([1]), new Set()]; }
export const out = read();
const g = globalThis;
g.WeakSet = function ShimWeakSet() {};
const { WeakSet } = g;
export const ws = new WeakSet();
let P2;
({ Promise: P2 } = globalThis);
export const p2 = P2;
const { [Symbol.iterator]: it, Set: S3 } = globalThis;
export const pair = [it, S3];
const { Promise: P3 } = (eff(), globalThis);
export const p3 = P3;
export const t = Promise?.try;
