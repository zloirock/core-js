import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref;
// Quiet backed realm hops and terminal probes retain their value contracts.
// Effectful realm keys keep reads, stores and effects; the independent array claim survives.
function eff(t) {
  return t;
}
let x;
export const stored = _globalThis[eff('a'), 'window'];
export const probed = (x = _globalThis[eff('b'), 'window']) == null ? void 0 : x.self.Array;
export const dottedTail = _self.window;
export const seqAfterBacked = _globalThis[eff('c'), 'self'][eff('d'), 'window'];
export const backedTerminal = _self;
let heldSeqTail;
export const seqKeyStore = heldSeqTail = _globalThis[eff('e'), 'self'][eff('f'), 'window'];
export { heldSeqTail };
export const keep = _atMaybeArray(_ref = [1]).call(_ref, 0);