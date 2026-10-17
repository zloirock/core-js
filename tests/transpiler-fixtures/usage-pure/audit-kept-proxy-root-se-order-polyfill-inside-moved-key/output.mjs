import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// Effects around a kept proxy store run once in source order. The store keeps its runtime value and any live nullish guard; a
// migrated key must preserve its own effects.
let c = 0;
export { c };
// a polyfillable call INSIDE the migrated key: its own rewrite must compose into the moved text
let y;
export const polyfillInsideMovedKey = (y = _globalThis.window)?.[_flatMaybeArray(_ref = [c]).call(_ref), "Array"].prototype.some.call([1], v => v);