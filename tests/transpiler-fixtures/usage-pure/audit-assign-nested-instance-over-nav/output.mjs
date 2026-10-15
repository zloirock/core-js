import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a nested INSTANCE claim under `prototype`, in the ASSIGNMENT host, over a NAV receiver. the
// overwrite this host emits dispatches on the receiver the pattern's own segments name, and that
// receiver is spelled by walking the init's nav (`globalThis` + `Array` + `prototype`) - the
// literal-only walk had nothing to hand it and the claim shipped native, which the stripped realm
// caught as `undefined` where the source reads a function. A defaulted user-slot read keeps its
// guard: an absent method takes the fallback while an instance still gets the ponyfill.
let flatA, flatB, atC, defaulted;
flatA = _flatMaybeArray(_globalThis.Array.prototype);
flatB = _flatMaybeArray(_globalThis.Array.prototype);
atC = _atMaybeArray(Array.prototype);
defaulted = (_ref = _findIndexMaybeArray((_globalThis.customHolder ?? {
  codes: []
}).codes)) === void 0 ? {
  "defaulted": () => 0
}["defaulted"] : _ref;
export { flatA, flatB, atC, defaulted };