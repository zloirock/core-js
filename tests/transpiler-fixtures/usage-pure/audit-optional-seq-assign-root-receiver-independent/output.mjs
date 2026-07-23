import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref, _ref2;
// an optional proxy chain rooted at a SEQUENCE whose tail is an assignment (`(c++, n = gw)?.self...`).
// the `?.` memoizes the root into the guard, running its SE (c++, the assign) there exactly ONCE; the
// tail collapses to a receiver-INDEPENDENT pure static (`_Map.prototype.has`), so the body reads that
// binding and must NOT re-fold the root SE (before the fix unplugin emitted `(c++, n = gw, _Map)` in
// the body - double-running `c++`). contrasts: a bare chain-assign root already collapsed this way; a
// no-assign sequence root deopts (no guard) and folds its SE once into the body. distinct ctor + method
// per line; all three now converge (no sidecar).
let n, c, a, e;
const gw = _globalThis;
export const seqAssign = null == (_ref = (c++, n = gw)) ? void 0 : _nameMaybeFunction(_Map.prototype.has);
export const chainAssign = null == (_ref2 = a = gw) ? void 0 : _nameMaybeFunction(_Set.prototype.add);
export const noAssign = _nameMaybeFunction((e++, _WeakMap).prototype.get);
export { c, e };