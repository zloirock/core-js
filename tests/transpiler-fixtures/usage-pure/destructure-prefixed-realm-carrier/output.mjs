import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// An effectful call returning the realm keeps one shared initializer for nested readers.
function getRealm() {
  return _globalThis;
}
const _ref = (effect(), getRealm());
const flat = _flatMaybeArray(_ref.Array.prototype);
const {
  Array: {
    isArray
  }
} = _ref;
use(flat, isArray);