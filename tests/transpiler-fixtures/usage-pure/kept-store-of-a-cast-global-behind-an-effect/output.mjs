import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _globalThis from "@core-js/pure/actual/global-this";
// A store a pattern's init keeps holds a global under a type cast, behind an effect.
// The cast leaves with the global it wraps, as wherever a bare global is swapped.
let kept: any;
export const viaDeclaration = _findLastMaybeArray((kept = (first(), _globalThis), _globalThis.Array.prototype));
export { kept };