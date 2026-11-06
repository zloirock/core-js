import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A kept store owns its RHS effects before the extracted read.
let held;
const method = _atMaybeArray((held = (effect(), _globalThis), _globalThis.Array.prototype));
use(held, method);