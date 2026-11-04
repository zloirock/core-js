import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// The nested instance read and its default run between the two outer getters.
export function read(fallback) {
  var _ref2;
  const {
      left
    } = Array,
    {
      prototype: _ref
    } = Array,
    at = (_ref2 = _atMaybeArray(_ref)) === void 0 ? fallback() : _ref2,
    {
      right
    } = Array;
  return [left, at, right];
}