import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// an assignment-form alias write inside an optional chain is conditional exactly when an
// optional hop sits AT or BELOW the slot's host - only then may the write never run. a hop
// strictly RIGHT of the slot cuts after the write already evaluated, so the registration
// keeps full flow-trust (static narrow); guarded shapes keep the runtime constructor check
let AW, IW, MW, PW, SW;
// spine-head computed key evaluates before the later optional hop - static narrow
a[{
  Array: AW
} = _globalThis].b?.c;
export const viaKeyBeforeOptional = _Array$of(1, 2);