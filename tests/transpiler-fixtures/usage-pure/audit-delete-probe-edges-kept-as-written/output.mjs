import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// probed `delete` edges kept as written: a DOUBLE undefinable hop stands down (no single test spells
// the union of both absences) and an OPAQUE call root keeps its own `?.`. a `delete` in a nested value
// context takes the same guard as the statement form.
export const delDoubleHop = delete _globalThis.window?.frames?.customZ;
function opaqueRoot() {
  return _globalThis;
}
export const delOpaque = delete opaqueRoot()?.window?.customW;
export const delNested = [null == _globalThis.window ? true : delete _self.customV];