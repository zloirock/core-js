import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _at from "@core-js/pure/actual/instance/at";
// a guarded dispatch inside the combined chain's ARGUMENTS keeps its guard local: hoisting
// it into the chain test would evaluate the callback's receiver outside the callback and
// short-circuit the whole chain on an unrelated nullish
export function mapped(arr, inner) {
  var _ref, _ref2;
  return null == (_ref = _flatMaybeArray(arr)) ? void 0 : _mapMaybeArray(_ref2 = _ref.call(arr)).call(_ref2, x => inner == null ? void 0 : _at(inner).call(inner, 0)).length;
}
export function argument(arr, inner) {
  var _ref3, _ref4;
  return null == (_ref3 = _flatMaybeArray(arr)) ? void 0 : _at(_ref4 = _ref3.call(arr)).call(_ref4, inner == null ? void 0 : _at(inner).call(inner, 0));
}
// the same locality one hop deeper: a guard inside an intermediate HOP's callback
export function hopCallback(arr, inner) {
  var _ref5, _ref6, _ref7;
  return null == (_ref5 = _flatMaybeArray(arr)) ? void 0 : _filterMaybeArray(_ref6 = _mapMaybeArray(_ref7 = _ref5.call(arr)).call(_ref7, x => inner == null ? void 0 : _at(inner).call(inner, 0)))?.call(_ref6, Boolean).length;
}
// a guarded dispatch inside a COMPUTED KEY of the receiver composes under the hoisted root
// guard without leaking out of the key position
export function computedKey(o, inner) {
  var _ref8;
  return o == null ? void 0 : _flatMaybeArray(_ref8 = o.rows[inner == null ? void 0 : _at(inner).call(inner, 0)])?.call(_ref8).length;
}