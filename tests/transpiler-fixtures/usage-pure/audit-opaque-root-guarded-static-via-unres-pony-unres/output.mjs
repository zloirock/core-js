import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2;
// a SECOND unresolvable hop past the ponyfillable one stays raw on the guarded ref (two
// sources of undefined: the nested test covers the window prefix, the outer memo test the
// chrome value). the static reads off the opaque chrome value, not a global - no collapse.
// the unplanned `chrome` tail rides inside the guarded branch
const upu = () => _globalThis;
export const viaUnresPonyUnres = null == (_ref = null == upu().window ? void 0 : _self.chrome) ? void 0 : _at(_ref2 = _ref.Array.of(14)).call(_ref2, 0);