import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// inside a FUNCTION scope the dead root memo prunes too: the scoped `var` list drops the
// excised name on both emitters (the flush declaration does not exist there)
export const nestedCombinedScoped = () => {
  var _ref2, _ref, _ref4, _ref3, _ref5;
  let w3;
  return null == (w3 = _globalThis.window) || null == (_ref = _flatMaybeArray(_ref2 = _Array$of(7))) || null == (_ref3 = _mapMaybeArray(_ref4 = _ref.call(_ref2))) ? void 0 : _atMaybeArray(_ref5 = _ref3.call(_ref4, x => x))?.call(_ref5, 0);
};