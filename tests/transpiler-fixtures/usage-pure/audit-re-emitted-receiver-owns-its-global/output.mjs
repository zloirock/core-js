import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// a receiver a render RE-EMITS keeps its own proxy-global substitution. the detector marks the
// sequence-buried global handled so no second rewrite lands inside the claim's span, but only a
// receiver-LESS claim really consumes it: an instance claim hands the receiver to its helper, and a
// `delete` target renders nothing at all. every memoizing shape below froze a raw `globalThis` there.
let seq = 0;
export const directCall = _atMaybeArray(_ref = (seq++, _globalThis).Array.prototype).call(_ref, 0);
export const optionalCall = _atMaybeArray(_ref2 = (seq++, _globalThis).Array.prototype)?.call(_ref2, 0);
export const parenLookup = (null == (_ref3 = (seq++, _globalThis).Array.prototype) ? void 0 : _atMaybeArray(_ref3)).call(_ref3, 0);
export const combined = null == (_ref4 = _atMaybeArray(_ref5 = (seq++, _globalThis).Array.prototype)) ? void 0 : _at(_ref6 = _ref4.call(_ref5, 0)).call(_ref6, 0);
export const spread = [..._atMaybeString(_ref7 = (seq++, _globalThis).String.prototype).call(_ref7, 0)];
// runtime-dead on purpose: a `delete` of a polyfillable key renders nothing, so only the receiver's
// own substitution can carry the global - and no runtime leg may actually perform this deletion
export const deleted = delete (seq++, _globalThis).Array.prototype.at;

// the plainly-wrapped `.call` beside them never memoized and never leaked - the control
export const plainWrap = _atMaybeArray((seq++, _globalThis).Array.prototype).call([1, 2], -1);
// NEGATIVE: a constructor that DOES collapse consumes the whole receiver, root included
export const collapsingCtor = (seq++, _Map).prototype.has;