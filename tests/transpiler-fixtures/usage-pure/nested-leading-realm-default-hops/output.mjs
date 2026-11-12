import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// Every leading pristine realm hop folds, including the one carrying a default.
const at = _atMaybeArray(_globalThis.Array.prototype);
use(at);