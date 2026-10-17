import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// an ENUM-member computed key names its member like every other spelling of that key: detection
// asks the TYPE layer's key-name resolver, which owns the enum fold (shadowing gate, merged blocks),
// instead of keeping a boundary the other spellings did not have - a literal, a template and a
// const-bound identifier chain all claimed here while the enum member alone stayed raw
enum HopKeys {
  MAP = 'map'
}
export const r4 = null == (_ref = _flatMaybeArray(arr)) || null == (_ref2 = _mapMaybeArray(_ref3 = _ref.call(arr)).call(_ref3, f)) ? void 0 : _at(_ref2).call(_ref2, 0);