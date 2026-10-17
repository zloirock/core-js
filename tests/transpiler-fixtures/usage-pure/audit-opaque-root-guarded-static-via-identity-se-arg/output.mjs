import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// an SE-carrying ARG of the identity root rides the kept test, exactly once, in source order
let idEff = 0;
export const viaIdentitySeArg = null == (x => x)((idEff++, _globalThis))?.window ? void 0 : _atMaybeArray(_ref = _Array$of(25)).call(_ref, 0);