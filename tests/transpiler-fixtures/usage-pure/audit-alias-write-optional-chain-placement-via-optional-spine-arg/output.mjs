import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
// an assignment-form alias write inside an optional chain is conditional exactly when an
// optional hop sits AT or BELOW the slot's host - only then may the write never run. a hop
// strictly RIGHT of the slot cuts after the write already evaluated, so the registration
// keeps full flow-trust (static narrow); guarded shapes keep the runtime constructor check
let AW, IW, MW, PW, SW;
// deep chain: the call is plain but an optional hop sits below its callee - guarded
a?.b.c((SW = _Symbol, _globalThis));
export const viaOptionalSpineArg = (SW === _Symbol ? _Symbol$for : SW.for.bind(SW))(wellKnownKey);