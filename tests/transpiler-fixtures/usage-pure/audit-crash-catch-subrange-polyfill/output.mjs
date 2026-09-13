import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A rewritten catch pattern retains polyfills inside its computed keys.
// The iterator key is read before the later instance call and property read.
try {} catch (_ref) {
  var _ref2;
  let it = _getIteratorMethod(_ref);
  let {
    [_atMaybeArray(_ref2 = [1]).call(_ref2, 0)]: b
  } = _ref;
  it();
  b;
}