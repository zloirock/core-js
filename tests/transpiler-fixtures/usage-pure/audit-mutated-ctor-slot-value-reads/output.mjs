import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// a whole-CTOR slot mutation (`globalThis.Ctor = Shim`) DEOPTS the name: the pure import
// would discard the user's shim, so every value read stays verbatim on the live binding.
// the mutated set is FILE-wide and order-insensitive: a read placed BEFORE the write deopts
// too (at runtime it sees the still-pristine slot - exactly what the untranspiled source
// reads there)
export const early = new Set([0]);
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
// a BARE-global value read stays raw too - every surface of a replaced ctor reads the
// replacement straight off the live binding
export const s = new Set();
// unmutated ctor control: still substitutes
export const m = new _Map([[1, 2]]);
// a const-alias receiver follows the same deopt on both sides
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
export const i2 = new Iterator();
// an SE-computed key keeps its in-place single run while the bare receiver stays raw
const {
  [k()]: v
} = Set;
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
// an object-shorthand value slot stays a plain shorthand - nothing rewrites on a deopted name
export const o = {
  Set
};
// `Promise` here is the LOCAL binding from the hop destructure above (it holds the shim
// at runtime), so the read stays on the local - no global dispatch applies
export const t = Promise?.try;
// an optional chain over a deopted BARE slot name keeps its guard - the live slot is
// not always-defined, unlike a pure import binding
export const u = Set?.union;
// a sequence-wrapped bare slot read keeps the prefix effect in place around the raw read
export const seqRecv = (eff(), Set).difference;
// an `in` check against the deopted bare name probes the live object
export const inCheck = 'union' in Set;
// an instance method on a replaced-slot construction stays RAW: the runtime instance is
// the shim's own, typing it as the pristine built-in would mis-dispatch
export const sub = new Set([1]).isSubsetOf(other);
// a computed string key reads the live object like any other member of it
// (`Promise` is locally shadowed above, so the deleted-slot `Iterator` probes this)
export const cd = Iterator['from'];
// a `typeof` operand stays raw like every other surface: the probe reads the real
// engine state, a ponyfill there would flip "undefined" on absent-slot engines
export const tg = typeof Set;