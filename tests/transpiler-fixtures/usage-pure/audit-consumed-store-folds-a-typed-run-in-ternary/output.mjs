import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the consumed-store fold through the TYPE layer, and the two sides of what a type wrapper means
// here: one written around the run's own SPAN is erased with the read it wrapped, while one written
// around the VALUE the store hands on SURVIVES the render - the runtime narrowing the collapse
// performs outranks the wider type, and the assertion still describes what the variable holds
let e = 0;
// ... and the same rule where the render is the STORE's own: the wrapper over the span it replaces
// goes with it, in whatever host the run stands (the declarator answered it first, and the other
// hosts reach this render through their own routes)
let stored: any;
export const inTernary = e ? (stored = (e++, _globalThis), _self).customProp : 0;
export { e };
export { stored };