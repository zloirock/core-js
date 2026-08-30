import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// the receiver's TYPE has to survive the guard render. an emitter that re-visits its own output asks
// the question a second time, and both spellings the render leaves are ones the raw shape checks miss:
// the probe ternary whose defined branch holds the collapsed surface, and the plugin-minted memo whose
// value is a proxy surface reached through a COMPUTED hop key. either one lost turns a provably Array
// receiver into the generic instance helper - on one leg only
let v, g, out;
function eff() {}
out = _nameMaybeFunction(_atMaybeArray((eff(), null == _globalThis.window ? void 0 : _self).Array.prototype));
export const stored = null == (_ref = (g = _globalThis, v = null == g[eff(), 'window'] ? void 0 : _self)) ? void 0 : _nameMaybeFunction(_atMaybeArray(_ref.Array.prototype));
export const read = out;