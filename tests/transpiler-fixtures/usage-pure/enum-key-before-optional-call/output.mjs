import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
var _ref, _ref2;
enum Keys {
  MAP = 'map'
}
export const mapped = null == (_ref = _flatMaybeArray(arr)) ? void 0 : (_mapMaybeArray(_ref2 = _ref.call(arr)) || 0).call(_ref2, f);