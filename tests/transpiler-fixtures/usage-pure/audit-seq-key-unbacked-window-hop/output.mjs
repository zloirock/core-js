import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// an SE-keyed hop the pure package cannot back (`window`) must survive the spine collapse
// in every position: the read - and the null probe over its stored value - discriminates
// window-less realms, and folding it onto the root would hand the probe an always-defined
// ponyfill
function eff(t) {
  return t;
}
let x;
export const stored = _globalThis[eff('a'), 'window'];
export const probed = (x = _globalThis[eff('b'), 'window']) == null ? void 0 : x.Array;
// ... and the dotted twins: a backed hop BELOW the unbacked terminal stays a real read too
// (folding `self` under the terminal `window` would erase the throw a self-less realm owes),
// while a backed TERMINAL still folds (the deep-nav realm collapse)
export const dottedTail = _globalThis.self.window;
export const seqAfterBacked = _globalThis[eff('c'), 'self'][eff('d'), 'window'];
export const backedTerminal = _self;
export const keep = _atMaybeArray(_ref = [1]).call(_ref, 0);