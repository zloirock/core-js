import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// The receiver is captured before its key in the parameter's evaluation frame.
// Nested argument claims stay live inside the captured invocation.
export function read(get, key, value = (() => {
  var _ref, _ref2;
  return _ref = get(), key(), (_at(_ref) || 0).call(_ref, _includesMaybeArray(_ref2 = [7]).call(_ref2, 7));
})()) {
  return value;
}