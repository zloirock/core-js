import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// an array pattern assigned in value position over a selection the build decides behind an effect
// prefix: the element reads off the array the selection yields, as for that array spelled alone
var groupBy, from, at;
export const grouped = () => {
  var _ref;
  return [{}] = _ref = (eff(), [_Map]), groupBy = _Map$groupBy, _ref;
};
export const listed = () => {
  var _ref2;
  return [, {}] = _ref2 = (eff(), [0, Array]), from = _Array$from, _ref2;
};
export const picked = () => {
  var _ref3, _ref4;
  return [_ref3] = _ref4 = (eff(), [[1]] || [user]), at = _atMaybeArray(_ref3), _ref4;
};