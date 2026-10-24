import _globalThis from "@core-js/pure/actual/global-this";
import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
import _self from "@core-js/pure/actual/self";
var _ref;
// ARRAY-pattern and const-alias computed-key destructures ride the probe like the named
// forms; an SE-key residual re-reads the source itself (throw + key SE both live there)
let c8 = 0;
export const viaSealedSeKeyResidual = (_ref = (null == _globalThis.window ? void 0 : _self.window).Object, null == _ref ? _ref[""] : (c8++, _Object$defineProperty));
export { c8 };