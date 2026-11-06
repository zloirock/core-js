import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// A store a pattern's init keeps holds a global behind nested effect sequences.
// The global is swapped where it stands in the innermost sequence, so every effect still runs, in order.
let viaAssignment, kept, keptAssign;
export const viaDeclaration = _atMaybeArray((kept = (first(), second(), _globalThis), _globalThis.Array.prototype));
keptAssign = (third(), fourth(), _globalThis);
viaAssignment = _flatMaybeArray(_globalThis.Array.prototype);
export { kept, keptAssign, viaAssignment };