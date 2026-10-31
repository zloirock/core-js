import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// A transparent wrapper does not turn a user binding into the global realm.
// Preserve supplied instance slots and the throw when the receiver is null.
function read(globalThis: any) {
  const {
      w: {
        Array: {
          prototype: _ref
        }
      }
    } = {
      w: globalThis!
    },
    at = _at(_ref),
    flat = _flatMaybeArray(_ref);
  return [at, flat];
}
use(read({
  Array: {
    prototype: {
      at: 19,
      flat: 23
    }
  }
}));