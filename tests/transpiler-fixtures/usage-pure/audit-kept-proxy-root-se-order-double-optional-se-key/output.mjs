import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// SEVERAL live `?.` along the kept chain: only the ROOT one guards anything real - the deeper hops
// are realm-local self-references whose guards are dead once the root is defined - so ONE memo at
// the root hosts the whole chain and every dropped key's effect migrates into the surviving key.
// anchoring the memo at the leaf-nearest `?.` instead buried the raw proxy root (and its redundant
// hop) inside the memo slot, out of reach of the root substitution and the hop collapse.
let db;
export const doubleOptionalSeKey = null == (db = _globalThis.window) ? void 0 : _findIndexMaybeArray(db[c++, c++, "Array"].prototype).call([1], v => v === 1);