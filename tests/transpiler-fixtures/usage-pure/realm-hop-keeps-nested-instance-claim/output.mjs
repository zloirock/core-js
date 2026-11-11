import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A realm-only anchor waits for its nested instance claim.
const at = _atMaybeArray(_globalThis.Array.prototype);
const {
  Object: o
} = _globalThis;
export { at, o };