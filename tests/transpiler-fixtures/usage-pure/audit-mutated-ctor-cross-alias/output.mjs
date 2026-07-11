import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _self from "@core-js/pure/actual/self";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a ctor-slot mutation through ONE global-proxy alias must be visible to reads through ANY
// other - the proxy names (`globalThis` / `self` / `window` / `global`) alias the same object
_self.Set = function ShimSet() {};
window.Promise = function ShimPromise() {};
// destructure value read through a DIFFERENT alias honors the shim (raw proxy read)
const {
  Set
} = _globalThis;
export const s = new Set([1]);
// flat value read through a different alias honors the shim too
export const P = _globalThis.Promise;
// reverse direction: `globalThis` mutation, read through `self`
_globalThis.Map = function ShimMap() {};
const {
  Map: ReadMap
} = _self;
export const m = new ReadMap();
// unmutated ctor control beside the patched slots still substitutes
const WeakMap = _WeakMap;
export const w = new WeakMap();
// a delete through one alias keeps the in-check through another alias DYNAMIC (no fold)
delete _self.Iterator;
export const has = 'Iterator' in _globalThis;
// the reverse in-check direction stays dynamic through the same canonical key
delete _globalThis.WeakSet;
export const hasW = 'WeakSet' in _self;
// a COMPUTED const-alias key resolves into the same canonical-key check
const k = 'Iterator';
export const hasComputed = k in _globalThis;
// the param-default mirror keeps the cross-alias mutated slot raw while the unmutated
// sibling still extracts
function read({
  Set: S,
  Array: {
    of
  }
} = {
  Set: _globalThis.Set,
  Array: {
    of: _Array$of
  }
}) {
  return [new S(), of(1)];
}
export const mirrored = read();