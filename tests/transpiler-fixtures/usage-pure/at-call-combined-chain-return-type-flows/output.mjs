import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
// the combined chain replaces the outer call with its own render, so the RETURN type it resolved
// has to travel to that replacement: a member above reads off it, and untyped there it resolves
// generic. `.name` off an array value then pulled the function-name ponyfill on the AST leg alone -
// one source, two import sets. the plain (non-optional) twin of each row never lost the type
const arr = [[1]];
export const namedAfterMap = null == (_ref = _atMaybeArray(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr, 0)).call(_ref2, x => x).name;
export const namedAfterFlat = null == (_ref3 = _atMaybeArray(arr)) ? void 0 : _flatMaybeArray(_ref4 = _ref3.call(arr, 0)).call(_ref4).name;
export const namedAfterTwoHops = null == arr || null == (_ref5 = _atMaybeArray(arr)) || null == (_ref6 = _mapMaybeArray(_ref7 = _ref5.call(arr, 0)).call(_ref7, x => x)) ? void 0 : _mapMaybeArray(_ref6).call(_ref6, x => x).name;
// the plain twin: same value, no guard to travel through
export const namedPlain = _mapMaybeArray(_ref8 = _atMaybeArray(arr).call(arr, 0)).call(_ref8, x => x).name;
// a genuinely unknown receiver still claims - the type is absent, not lost
const unknown = _globalThis.unknownThing;
export const namedUnknown = _nameMaybeFunction(_mapMaybeArray(unknown).call(unknown, x => x));