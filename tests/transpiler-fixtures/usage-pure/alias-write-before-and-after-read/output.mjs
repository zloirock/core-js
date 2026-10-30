import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$toStringTag from "@core-js/pure/actual/symbol/to-string-tag";
// A later alias assignment cannot narrow an earlier read of the same binding.
// The initialized read selects the well-known symbol; a parameter shadow keeps its own property.
let held;
export const before = held === _Symbol ? _Symbol$toStringTag : held?.toStringTag;
held = _Symbol;
export const after = _Symbol$iterator;
export function shadow(held) {
  return held.isConcatSpreadable;
}