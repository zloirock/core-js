import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// A later realm write cannot change the type of this earlier read.
const at = _atMaybeArray(_self.Array.prototype);
if (flag) _globalThis.self = other;
export { at };