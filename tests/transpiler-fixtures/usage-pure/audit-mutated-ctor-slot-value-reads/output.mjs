import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a whole-CTOR slot mutation (`globalThis.Ctor = Shim`) owns every VALUE read of that ctor:
// the pure import would discard the user's shim. the mutated set is FILE-wide and
// order-insensitive: a read placed BEFORE the write re-routes too (at runtime it sees the
// still-pristine slot - exactly what the untranspiled source reads there)
export const early = new (_globalThis.Set === undefined ? _Set : _globalThis.Set)([0]);
_globalThis.Promise = function ShimPromise() {};
_globalThis.Set = function ShimSet() {};
// nested proxy-hop value read anchors on the raw proxy member (the shim), not the pure ctor
const {
  Promise
} = _globalThis;
export const p = Promise;
// the nested-mirror passthrough keeps the mutated slot as the raw proxy member while the
// unmutated sibling still extracts its polyfill
function read({
  Array: {
    from
  },
  Set
} = {
  Array: {
    from: _Array$from
  },
  Set: _globalThis.Set
}) {
  return [from([1]), new Set()];
}
export const out = read();
// a BARE-global value read follows the slot too - every surface of a replaced ctor reads
// the replacement through the global-object binding
export const s = new (_globalThis.Set === undefined ? _Set : _globalThis.Set)();
// unmutated ctor control: still substitutes
export const m = new _Map([[1, 2]]);
// a const-alias receiver routes through the same slot canon on both sides
const g = _globalThis;
g.WeakSet = function ShimWeakSet() {};
const {
  WeakSet
} = g;
export const ws = new WeakSet();
// an assignment destructure (no declarator) honors the mutated slot the same way
let P2;
({
  Promise: P2
} = _globalThis);
export const p2 = P2;
// a DELETED slot is a mutation too: the bare read follows the now-empty slot instead of
// binding the module-cached ponyfill
delete _globalThis.Iterator;
export const i2 = new (_globalThis.Iterator === undefined ? _Iterator : _globalThis.Iterator)();
// an SE-computed key keeps its in-place single run while the bare receiver re-routes
const {
  [k()]: v
} = _globalThis.Set === undefined ? _Set : _globalThis.Set;
export const sk = v;
// a symbol-iterator extraction is receiver-based, so it coexists with a mutated sibling
// slot: the synth extraction runs off the proxy while the slot stays in the raw residual
const it = _getIteratorMethod(_globalThis);
const {
  Set: S3
} = _globalThis;
export const pair = [it, S3];
// an SE-bearing init with a mutated slot keeps the effect in place (no lift, one eval)
const {
  Promise: P3
} = (eff(), _globalThis);
export const p3 = P3;
// an object-shorthand value slot expands - a member text cannot sit in shorthand position
export const o = {
  Set: _globalThis.Set === undefined ? _Set : _globalThis.Set
};
// `Promise` here is the LOCAL binding from the hop destructure above (it holds the shim
// at runtime), so the read stays on the local - no global dispatch applies
export const t = Promise?.try;
// an optional chain over a re-routed BARE slot name keeps its guard - the live slot is
// not always-defined, unlike a pure import binding
export const u = (_globalThis.Set === undefined ? _Set : _globalThis.Set)?.union;
// a sequence-wrapped bare slot read keeps the prefix effect in place around the backstop
export const seqRecv = (eff(), _globalThis.Set === undefined ? _Set : _globalThis.Set).difference;
// an `in` check against the re-routed bare name probes the backstopped object
export const inCheck = 'union' in (_globalThis.Set === undefined ? _Set : _globalThis.Set);
// an instance method on a replaced-slot construction stays RAW: the runtime instance is
// the shim's own, typing it as the pristine built-in would mis-dispatch
export const sub = new (_globalThis.Set === undefined ? _Set : _globalThis.Set)([1]).isSubsetOf(other);
// a computed string key reads through the backstop and pins the static's own entry
// (`Promise` is locally shadowed above, so the deleted-slot `Iterator` probes this)
export const cd = (_globalThis.Iterator === undefined ? _Iterator : _globalThis.Iterator)['from'];
// a `typeof` operand keeps the PLAIN slot read - no backstop: the guard probes the real
// engine state, a ponyfill there would flip "undefined" on absent-slot engines
export const tg = typeof _globalThis.Set;