import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// the live `?.` may sit deeper than the root, with the root itself plain
export function deeperSeated(a) {
  var _ref, _ref3, _ref2, _ref4;
  return null == (_ref = a.b) || null == (_ref2 = _flatMaybeArray(_ref3 = _ref.c)) ? void 0 : _mapMaybeArray(_ref4 = _ref2.call(_ref3)).call(_ref4, x => x).length;
}