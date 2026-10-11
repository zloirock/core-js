import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// A `||` whose left yields an array literal never runs its right, whether the literal is written there
// or an `&&` the build decides yields it, held in a const. A destructure off the selection reads the
// literal's own slots: a method several types carry takes the array's polyfill, not the generic one
const list = [1] || defaults;
export const at = _atMaybeArray(list);
export const includes = _includesMaybeArray([2] || defaults);