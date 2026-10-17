import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// the consumed-store fold through the TYPE layer, and the two sides of what a type wrapper means
// here: one written around the run's own SPAN is erased with the read it wrapped, while one written
// around the VALUE the store hands on SURVIVES the render - the runtime narrowing the collapse
// performs outranks the wider type, and the assertion still describes what the variable holds
let e = 0;
let held: any;
function dh(): typeof globalThis {
  return _globalThis;
}
export const castOnCallRoot = _nameMaybeFunction((held = (e++, _self), _Map));
export { e };
export { held };