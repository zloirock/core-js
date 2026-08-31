import _globalThis from "@core-js/pure/actual/global-this";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$hypot from "@core-js/pure/actual/math/hypot";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Object$seal from "@core-js/pure/actual/object/seal";
import _self from "@core-js/pure/actual/self";
import _structuredClone from "@core-js/pure/actual/structured-clone";
// pattern-hop (anchored) destructures over an UNDEFINABLE probe nav: the source read throws
// where the probe yields undefined, so every anchored render rides the guard-value spelling
// instead of the always-defined receiver / ctor bindings
// FULL consumes outside the anchor gate carry the same once-per-pattern probe: multi-prop
// nested, single-level flat (the probe read is the pattern key itself), array-wrapped
// (the probe value is the descended element), and the assignment-host cascade
export const viaMultiPropA = ((null == _globalThis.window ? void 0 : _self).Math, _Math$cbrt);
export const viaMultiPropB = _Object$seal;
export const viaFlatBareNav = ((null == _globalThis.window ? void 0 : _self).structuredClone, _structuredClone);
export const viaArrayWrapped = ((null == _globalThis.window ? void 0 : _self).Math, _Math$hypot);
let viaAssignFull;
viaAssignFull = ((null == _globalThis.window ? void 0 : _self).Math, _Math$sign);
export { viaAssignFull };