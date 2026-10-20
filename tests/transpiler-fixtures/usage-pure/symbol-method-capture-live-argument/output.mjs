import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A symbol method with arguments keeps the first receiver and its own this value.
// The nested argument claim is visited after rendering the outer invocation.
export function read(get) {
  var _ref, _ref2;
  return (_getIteratorMethod(_ref = get()) || 0).call(_ref, _atMaybeArray(_ref2 = [7]).call(_ref2, 0));
}