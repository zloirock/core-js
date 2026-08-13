import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// the TAIL hop's slot is the user's object here: the collapse at the deepest ponyfillable hop
// still spells `_self.window` - the raw tail read goes THROUGH the patched slot and answers the
// user's value, so the collapse stays sound; the guarded twin keeps its guard (the patched slot
// is not a realm self-reference, so hop-dropping below it is off)
_globalThis.window = {
  Map: {
    name: 'patched'
  }
};
let q;
export const patchedTailRead = _nameMaybeFunction((q = _self.window).Map);
export const patchedTailGuarded = null == (_ref = q = _self.window) ? void 0 : _nameMaybeFunction(_ref.Map);