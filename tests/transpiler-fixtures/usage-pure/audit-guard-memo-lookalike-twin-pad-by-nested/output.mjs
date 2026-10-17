import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
export function padByNested(fn, o) {
  var _ref, _ref2;
  return null == (_ref = o.text) ? void 0 : (_padStartMaybeString(_ref) || 0).call(_ref, _flatMapMaybeArray(_ref2 = o.items).call(_ref2, fn).length);
}