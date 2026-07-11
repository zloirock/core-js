// a whole-CTOR slot mutation (`globalThis.Ctor = Shim`) owns every VALUE read of that ctor:
// the pure import would discard the user's shim. the mutated set is FILE-wide and
// order-insensitive: a read placed BEFORE the write re-routes too (at runtime it sees the
// still-pristine slot - exactly what the untranspiled source reads there)
export const early = new Set([0]);
globalThis.Promise = function ShimPromise() {};
globalThis.Set = function ShimSet() {};
// nested proxy-hop value read anchors on the raw proxy member (the shim), not the pure ctor
const { self: { Promise } } = globalThis;
export const p = Promise;
// the nested-mirror passthrough keeps the mutated slot as the raw proxy member while the
// unmutated sibling still extracts its polyfill
function read({ Array: { from }, Set } = globalThis) { return [from([1]), new Set()]; }
export const out = read();
// a BARE-global value read follows the slot too - every surface of a replaced ctor reads
// the replacement through the global-object binding
export const s = new Set();
// unmutated ctor control: still substitutes
export const m = new Map([[1, 2]]);
// a const-alias receiver routes through the same slot canon on both sides
const g = globalThis;
g.WeakSet = function ShimWeakSet() {};
const { WeakSet } = g;
export const ws = new WeakSet();
// an assignment destructure (no declarator) honors the mutated slot the same way
let P2;
({ Promise: P2 } = globalThis);
export const p2 = P2;
// a DELETED slot is a mutation too: the bare read follows the now-empty slot instead of
// binding the module-cached ponyfill
delete globalThis.Iterator;
export const i2 = new Iterator();
// an SE-computed key keeps its in-place single run while the bare receiver re-routes
const { [k()]: v } = Set;
export const sk = v;
// a symbol-iterator extraction is receiver-based, so it coexists with a mutated sibling
// slot: the synth extraction runs off the proxy while the slot stays in the raw residual
const { [Symbol.iterator]: it, Set: S3 } = globalThis;
export const pair = [it, S3];
// an SE-bearing init with a mutated slot keeps the effect in place (no lift, one eval)
const { Promise: P3 } = (eff(), globalThis);
export const p3 = P3;
// an object-shorthand value slot expands - a member text cannot sit in shorthand position
export const o = { Set };
// `Promise` here is the LOCAL binding from the hop destructure above (it holds the shim
// at runtime), so the read stays on the local - no global dispatch applies
export const t = Promise?.try;
// an optional chain over a re-routed BARE slot name keeps its guard - the live slot is
// not always-defined, unlike a pure import binding
export const u = Set?.union;
