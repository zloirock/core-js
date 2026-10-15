import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// Nested instance extraction through a non-null realm still needs the realm's polyfill.
// Both captured methods must work without the native global and prototype methods.
const {
    w: {
      Array: {
        prototype: _ref
      }
    }
  } = {
    w: _globalThis
  },
  at = _atMaybeArray(_ref),
  flat = _flatMaybeArray(_ref);
use(at, flat);