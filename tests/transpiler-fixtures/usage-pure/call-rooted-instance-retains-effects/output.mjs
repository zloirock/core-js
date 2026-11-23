import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// Capturing a realm-producing call keeps its effects before both property reads.
function get() {
  effect();
  return _globalThis;
}
const _ref2 = get(),
  {
    Array: _ref
  } = _ref2;
const flat = _flatMaybeArray(_ref.prototype),
  {
    isArray
  } = _ref;
export { flat, isArray };