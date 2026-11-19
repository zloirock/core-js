import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A later constructor write cannot invalidate an earlier extraction.
const at = _atMaybeArray(Array.prototype);
if (flag) _globalThis.Array = other;
export { at };