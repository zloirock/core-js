import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.symbol.to-string-tag";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.json.to-string-tag";
import "core-js/modules/es.math.to-string-tag";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A later alias assignment cannot narrow an earlier read of the same binding.
// The initialized read selects the well-known symbol; a parameter shadow keeps its own property.
let held;
export const before = held?.toStringTag;
({
  Symbol: held
} = globalThis);
export const after = held.iterator;
export function shadow(held) {
  return held.isConcatSpreadable;
}