import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A sole nested receiver carries the initializer prefix exactly once.
const method = _atMaybeArray((effect(), _globalThis.Array.prototype));
use(method);