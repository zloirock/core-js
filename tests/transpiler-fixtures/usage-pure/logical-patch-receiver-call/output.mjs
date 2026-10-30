import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// The implicit patch read reuses the receiver evaluated before the key.
function read() {
  effect();
  return [];
}
export const method = _atMaybeArray(_ref = read()) || (_ref.at = fallback);