import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A local helper proven to return the realm stands for it: the nested prototype claim reads the realm's
// constructor, and the call, which runs nothing, leaves with the pattern.
let at5;
function mk() {
  return _globalThis;
}
at5 = _atMaybeArray(_globalThis.Array.prototype);