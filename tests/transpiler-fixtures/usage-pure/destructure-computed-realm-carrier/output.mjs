import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// An effectful call returning the realm keeps one shared initializer for nested readers.
function getRealm() {
  effect();
  return _globalThis;
}
const _ref2 = getRealm(),
  {
    Array: _ref
  } = _ref2;
const flat = _flatMaybeArray(_ref.prototype),
  {
    isArray
  } = _ref;
use(flat, isArray);