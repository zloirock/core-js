import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3, _ref4, _ref5;
// NESTED combined chains: the inner chain's own lookup test joins the enclosing test the same way
// a claim guard does, at any nesting depth
let w;
export const nestedCombined = null == (w = _globalThis.window) || null == (_ref = _flatMaybeArray(_ref2 = _Array$of(5))) || null == (_ref3 = _mapMaybeArray(_ref4 = _ref.call(_ref2))) ? void 0 : _atMaybeArray(_ref5 = _ref3.call(_ref4, x => x))?.call(_ref5, 0);