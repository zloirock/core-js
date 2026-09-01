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
// ... and the dotted twins: the terminal `window` keeps its slot while the backed run BELOW it
// collapses onto its own ponyfill and hands the probe on (`_self.window`) - reading `self` raw
// off the pure root is the one spelling neither leg owes - while a backed TERMINAL folds whole
// (the deep-nav realm collapse)
export const dottedTail = _self.window;
export const seqAfterBacked = (eff('c'), _self)[eff('d'), 'window'];
export const backedTerminal = _self;
// ... and a STORE over the SE-keyed twin keeps the same base: the store canon folds a tail it
// can DROP, and a tail whose key carries effects is not one - standing down there would read
// the probe off the ROOT while the dotted twin one line up reads the ponyfill
let heldSeqTail;
export const seqKeyStore = heldSeqTail = (eff('e'), _self)[eff('f'), 'window'];
export { heldSeqTail };
export const keep = _atMaybeArray(_ref = [1]).call(_ref, 0);