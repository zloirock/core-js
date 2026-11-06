import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a chain-assign root storing an UNDEFINABLE proxy nav (`globalThis.window` - `window` has no pure entry)
// under an optional `?.`, consumed by a polyfilled dispatch. the value is STORED, so the chain cannot root
// through to the pure global (that would rebind the variable) - the guard is correctly KEPT. but the guard
// root must still SUBSTITUTE its own proxy nav (`w = _globalThis.window`, not raw `globalThis` -> IE11
// ReferenceError) and the receiver-INDEPENDENT body must COLLAPSE to the pure ctor (`_Map` / `_Array$of`,
// not a raw `_ref.Map` native read). the assign SE runs ONCE in the guard. distinct ctor/static + trailer
// per line; single-hop and multi-hop (self.window); both emitters converge.
let w, v, u;
export const ctorName = null == (w = _globalThis.window) ? void 0 : _nameMaybeFunction(_Map);
export const staticAt = null == (v = _globalThis.window) ? void 0 : _atMaybeArray(_ref = _Array$of(5)).call(_ref, 0);
export const multiHopFrom = null == (u = _self.window) ? void 0 : _includesMaybeArray(_ref2 = _Array$from([1])).call(_ref2, 1);