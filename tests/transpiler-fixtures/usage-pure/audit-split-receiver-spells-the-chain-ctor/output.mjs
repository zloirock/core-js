import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A stored effectful realm read keeps its computed tail and independent instance dispatch.
let v, g, out, k;
function eff() {}
out = null == (_ref = (g = _globalThis, v = g[eff(), 'window']?.self)) ? void 0 : _nameMaybeFunction(_at(_ref.Promise[k]));
export const read = out;
export const race = (g = _globalThis, v = g[eff(), 'window']?.self)?.Promise.race([]);