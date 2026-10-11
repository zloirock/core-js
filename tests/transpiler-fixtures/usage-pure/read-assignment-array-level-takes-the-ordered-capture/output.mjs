import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _Map from "@core-js/pure/actual/map";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// A destructuring assignment whose value is read yields its right side, so no mirror may replace it:
// an array level takes the ordered capture instead - the right captured once and kept as the result,
// each element read in turn, the claim written in its source slot.
let at, first, groupBy, includes;
export const viaInstance = ([_ref] = _ref2 = [[1, 2]], at = _atMaybeArray(_ref), _ref2);
export const viaStatic = ([_ref3, {}] = _ref4 = [use(), _Map], first = _ref3, groupBy = _Map$groupBy, _ref4);
export const viaKeyedLevel = (_ref5 = {
  W: _ref6
} = {
  W: [[3]]
}, [_ref7] = _ref6, includes = _includesMaybeArray(_ref7), _ref5);
export { at, first, groupBy, includes };