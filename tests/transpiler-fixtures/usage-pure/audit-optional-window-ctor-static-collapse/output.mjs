import _globalThis from "@core-js/pure/actual/global-this";
import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Number$MAX_SAFE_INTEGER from "@core-js/pure/actual/number/max-safe-integer";
import _Number$parseInt from "@core-js/pure/actual/number/parse-int";
var _ref, _ref2;
// a ctor STATIC reached THROUGH a kept undefinable window guard (`(w = globalThis.window)?.Number
// .MAX_SAFE_INTEGER`, `?.Number.parseInt(...)`): the ctor (`Number`) carries no pure GLOBAL entry, but the
// static (`Number.MAX_SAFE_INTEGER` / `Number.parseInt`) does. the static is receiver-INDEPENDENT, so it
// collapses to its pure form (`_Number$MAX_SAFE_INTEGER`) with the root SE owned by the guard - not a raw
// `_ref.Number.MAX_SAFE_INTEGER` read off the memo (native = missed polyfill). single-hop and multi-hop
// (self.window) roots; a trailing instance method, a static-call, and a bare static-call. both emitters converge.
let w, v, u;
export const maxSafe = null == (_ref = w = _globalThis.window) ? void 0 : _toFixedMaybeNumber(_ref2 = _Number$MAX_SAFE_INTEGER).call(_ref2, 1);
export const parseHop = null == (v = _globalThis.self.window) ? void 0 : _Number$parseInt("42", 10);
export const isInt = null == (u = _globalThis.window) ? void 0 : _Number$isInteger(5);