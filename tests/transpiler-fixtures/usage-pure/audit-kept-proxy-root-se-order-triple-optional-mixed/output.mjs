import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
let tr;
export const tripleOptionalMixed = null == (tr = _globalThis.window) ? void 0 : (c++, c++, _Array$of(9));