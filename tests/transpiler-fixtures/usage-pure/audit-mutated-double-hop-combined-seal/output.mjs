import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// a MUTATED static behind a double proxy-hop optional chain: the mutation cancels the
// always-defined claim the proxy-prefix deopt leans on, so the `?.` must keep its guard and
// the memo must bind the chain ROOT (the one value that can be undefined) - the sealed
// emit `((n = w)?.Array).of(1)` threw where native short-circuits, and a nav-level memo
// self-collapsed into an always-defined ponyfill (guard never fired, silent wrong value)
_globalThis.Array.of = function patched() {
  return [7];
};
_globalThis.Set = class PatchedSet extends Set {};
let n;
export const doubleHop = null == (n = _globalThis.window) ? void 0 : _flatMaybeArray(_ref = n.Array.of(1))?.call(_ref);
let p;
let sc = 0;
export const sePrefixRoot = null == (sc++, p = _globalThis.window) ? void 0 : _flatMaybeArray(_ref2 = p.Array.of(1))?.call(_ref2);
let m, q;
export const nestedAssign = null == (m = q = _globalThis.window) ? void 0 : _flatMaybeArray(_ref3 = m.Array.of(1))?.call(_ref3);
let e;
export const earlyArmOptionalCall = (e = _globalThis.window)?.Array?.of(1);
let v;
export const mutatedNameTail = null == (v = _globalThis.window) ? void 0 : _at(_ref4 = _nameMaybeFunction(v.Set))?.call(_ref4, 0);
// single-hop spelling of the same family (the previously locked canon holds)
let s;
export const singleHop = null == (s = _globalThis.window) ? void 0 : _flatMaybeArray(_ref5 = s.Array.of(1))?.call(_ref5);
// an always-defined root keeps the deopt even under the mutated landing: the raw read
// hangs off a defined object and cannot throw, so the dead guard stays dropped
let d;
export const resolvableRoot = _flatMaybeArray(_ref6 = (d = _globalThis, _self).Array.of(1))?.call(_ref6);
// an ALIAS value resolves through the same family walk: the aliased `window` is exactly as
// undefinable as the spelled-out nav, so the guard survives here too
const w = _globalThis.window;
let a;
export const aliasValueRoot = null == (a = w) ? void 0 : _flatMaybeArray(_ref7 = a.Array.of(1))?.call(_ref7);
// a mutated CONSTRUCTOR slot cancels the claim the same way a mutated static does
let c;
export const mutatedCtorSlot = null == (c = _globalThis.window) ? void 0 : _at(_ref8 = _nameMaybeFunction(c.Set))?.call(_ref8, 0);
// the mutated slot read off a SEALED receiver: the seal ends the chain, so the source reads the
// key off a value that CAN be undefined and throws there. collapsing the navigation away answered
// the patched value instead - the guarded read has to survive, and it is the ANSWER as well as the
// throw: a mutation cancels the ponyfill, so there is nothing else for the collapse to substitute
export const sealedMutatedSlot = (null == _globalThis.window ? void 0 : _self).Set;

// a NON-mutated polyfillable builtin in the same nav shape: nothing cancels the claim, so the
// leaf routes through its ponyfill while the guard still binds the undefinable root
let nm;
export const nonMutatedStatic = null == (nm = _globalThis.window) ? void 0 : _Map$groupBy([1], x => x);