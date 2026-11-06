import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// In pure, an alias, a destructured value and a wrapped expression follow the same
// proxy-value rule: a backed leaf collapses a plain middle hop; a terminal environment
// probe or an optional inside the value keeps its guard. Reassigned aliases stay raw.
// Filtered Object statics below lock the receiver spelling rather than an import.

// --- alias spellings ---
const aliasWindow = _globalThis.window;
let k1;
export const aliasOfUnponyfilled = null == (k1 = aliasWindow) ? void 0 : _Map$groupBy([1, 2], v => v % 2);