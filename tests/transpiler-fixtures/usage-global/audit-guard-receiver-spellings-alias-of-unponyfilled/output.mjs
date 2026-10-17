import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// In pure, an alias, a destructured value and a wrapped expression follow the same
// proxy-value rule: a backed leaf collapses a plain middle hop; a terminal environment
// probe or an optional inside the value keeps its guard. Reassigned aliases stay raw.
// Filtered Object statics below lock the receiver spelling rather than an import.

// --- alias spellings ---
const aliasWindow = globalThis.window;
let k1;
export const aliasOfUnponyfilled = (k1 = aliasWindow)?.Map.groupBy([1, 2], v => v % 2);