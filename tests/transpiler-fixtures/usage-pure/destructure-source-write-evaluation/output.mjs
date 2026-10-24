import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
var _ref, _ref3;
// The initializer is captured before the key changes its source binding.
const events = [];
const first = [4, 5];
let current = first;
const _ref2 = ((_pushMaybeArray(events) || 0).call(events, _flatMaybeArray(_ref = [1]).call(_ref)[0]), current);
const method = null == _ref2 ? _ref2[""] : (_pushMaybeArray(events).call(events, 'key'), current = 'xy', (_ref3 = _atMaybeArray(_ref2)) === void 0 ? {
  "method": () => -1
}["method"] : _ref3);
const contains = _includesMaybeArray(_ref2);
export { method, contains };
method.call(first, -1);
contains.call(first, 4);