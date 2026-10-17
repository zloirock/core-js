import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// an ALIAS-carried kept root: the alias identifier is already rewritten by its declaration, and the
// migrated key composes over it exactly like over the direct spelling
const alias = _globalThis;
let z;
export const aliasKeptSeKey = null == (z = alias.window) ? void 0 : _findLastIndexMaybeArray(z[c++, "Array"].prototype).call([1], v => v);