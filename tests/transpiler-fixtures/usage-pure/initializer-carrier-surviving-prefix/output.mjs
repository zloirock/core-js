import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A surviving binding and the extracted read share the initializer.
const method = _atMaybeArray((effect(), _globalThis.Array.prototype));
const {
  other
} = _globalThis;
use(method, other);