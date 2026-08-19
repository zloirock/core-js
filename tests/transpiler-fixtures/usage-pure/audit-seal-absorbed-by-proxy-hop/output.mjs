import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3, _ref4, _ref5;
// the hop directly above a seal is itself a proxy hop, so the guard render absorbs it and the
// paren goes with it. the read at that hop is the source's own throw and must survive: no fold
// into the guarded alternate, and no `?.` handed back where the source wrote a plain read
export function viaParamDefault({
  at
} = (null == _globalThis.window ? void 0 : _self).box) {
  return at;
}
export let stored;
export const viaChainAssign = _at(_ref = stored = (null == _globalThis.window ? void 0 : _self).box).call(_ref, 0);
export const viaDelete = delete _globalThis.box.at;

// NEGATIVE, opposite polarity: the `?.` sits OUTSIDE the seal, so the sealed value is what the
// short-circuit produced and the plain read above it observes that - a throw either way, and the
// guard belongs INSIDE the dispatch argument rather than around it
export const viaOuterOptional = _at(_ref2 = (null == _globalThis.window ? void 0 : _self).box).call(_ref2, 0);

// the same polarity over a chain-ASSIGN root: the write stores the nav and the seal observes what
// it produced, so the dropped hop's `?.` may not be re-hung on the leaf - the read is plain and
// throws. the value question reads THROUGH the write here; the routing verdict deliberately does
// not, because flipping that globally strands a raw root in a guard memo
export let held;
export const viaChainAssignRoot = _at(_ref3 = (held = _globalThis.window).box).call(_ref3, 0);

// NEGATIVE: a seal over an always-defined value (the parens only group the assignment) is not a
// read the guard can swallow - the fold keeps running there
export let grouped;
export const viaGroupedAssign = null == (_ref4 = (grouped = _globalThis).window) ? void 0 : _at(_ref5 = _ref4.box).call(_ref5, 0);