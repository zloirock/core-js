import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// an effect in the VALUE and another in the KEY of the same access: the value's stays inside the
// assignment, the key's rides the migrated key - two channels, native order for each
let sv;
export const seqValueAndKey = null == (sv = (c++, _globalThis.window)) ? void 0 : _mapMaybeArray(sv[c++, "Array"].prototype).call([1], v => v);