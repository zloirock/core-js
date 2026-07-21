import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15;
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
export const doubleHop = null == (_ref = n = _globalThis.window) ? void 0 : _flatMaybeArray(_ref2 = _ref.Array.of(1))?.call(_ref2);
let p;
let sc = 0;
export const sePrefixRoot = null == (_ref3 = (sc++, p = _globalThis.window)) ? void 0 : _flatMaybeArray(_ref4 = _ref3.Array.of(1))?.call(_ref4);
let m, q;
export const nestedAssign = null == (_ref5 = m = q = _globalThis.window) ? void 0 : _flatMaybeArray(_ref6 = _ref5.Array.of(1))?.call(_ref6);
let e;
export const earlyArmOptionalCall = (e = _globalThis.window)?.Array?.of(1);
let v;
export const mutatedNameTail = null == (_ref7 = v = _globalThis.window) ? void 0 : _at(_ref8 = _nameMaybeFunction(_ref7.Set))?.call(_ref8, 0);
// single-hop spelling of the same family (the previously locked canon holds)
let s;
export const singleHop = null == (_ref9 = s = _globalThis.window) ? void 0 : _flatMaybeArray(_ref10 = _ref9.Array.of(1))?.call(_ref10);
// an always-defined root keeps the deopt even under the mutated landing: the raw read
// hangs off a defined object and cannot throw, so the dead guard stays dropped
let d;
export const resolvableRoot = _flatMaybeArray(_ref11 = (d = _globalThis, _globalThis).Array.of(1))?.call(_ref11);
// an ALIAS value resolves through the same family walk: the aliased `window` is exactly as
// undefinable as the spelled-out nav, so the guard survives here too
const w = _globalThis.window;
let a;
export const aliasValueRoot = null == (_ref12 = a = w) ? void 0 : _flatMaybeArray(_ref13 = _ref12.Array.of(1))?.call(_ref13);
// a mutated CONSTRUCTOR slot cancels the claim the same way a mutated static does
let c;
export const mutatedCtorSlot = null == (_ref14 = c = _globalThis.window) ? void 0 : _at(_ref15 = _nameMaybeFunction(_ref14.Set))?.call(_ref15, 0);
// a NON-mutated polyfillable builtin in the same nav shape: nothing cancels the claim, so the
// leaf routes through its ponyfill while the guard still binds the undefinable root
let nm;
export const nonMutatedStatic = null == (nm = _globalThis.window) ? void 0 : _Map$groupBy([1], x => x);