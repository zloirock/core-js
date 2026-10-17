import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
let a;
export const effectInsideValue = _flatMaybeArray((a = (c++, _globalThis.window)).Array.prototype).call([1, [2]]);
export { c };