import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The declined leaf keeps both the receiver-prefix and computed-key claims live.
const root = () => _globalThis;
export function read(effects) {
  var _ref, _ref2;
  return (_pushMaybeArray(effects).call(effects, 'outer'), (_pushMaybeArray(effects) || 0).call(effects, _atMaybeArray(_ref = _Array$from('i')).call(_ref, 0)), _self)[(_pushMaybeArray(effects) || 0).call(effects, _includesMaybeArray(_ref2 = [7]).call(_ref2, 7)), 'declinedNavigationMissing'];
}