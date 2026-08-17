import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _ref3;
// the same seals with REAL paren nodes in the AST: under `createParenthesizedExpressions` the
// grouping is a node rather than a flag, and every walk that reads only the flag stops seeing the
// seal. the guard a claim renders must stay INSIDE the helper that consumes it either way
// the sidecar here is COSMETIC and nothing more: both legs render the read the seal makes
// observable, and differ only in printer parens and blank lines around the spliced spans
export const sealedCtorLeaf = _nameMaybeFunction((null == _globalThis.window ? void 0 : _Map));

export const sealedDeepCtorLeaf = _nameMaybeFunction((null == _globalThis.window ? void 0 : _Map));

export const sealedAbsorbedHop = delete (null == _globalThis.window ? void 0 : _self).box.at;

const host = {};
export const sealedStartParen = null == (_ref = _flatMaybeArray(_ref2 = host.box?.missing)) ? void 0 : _at(_ref3 = _ref.call(_ref2)).call(_ref3, 0);

// a DEEP sealed nav reaches the guard channel only if the plan peels this spelling of the seal
// too: stopping at the paren node routed the same source through the erase instead, and the guard
// the flag spelling keeps was dropped - a write host then targeted the live realm global
export let assigned;

export function deepSealedWrite(v) {
  (null == _self.window ? void 0 : _self).Box = v;
}
export const deepSealedRead = (null == _self.window ? void 0 : _self).Box;

// a sealed CALLEE ends the chain, so the call applies to the guard's VALUE and must stay OUTSIDE
// the ternary: folded into the alternate it would answer `undefined` where the source calls an
// undefined value and throws. the seal is this very node here, not a layer above it
export const sealedCallee = (null == _globalThis.window ? void 0 : _self)(1);
export const sealedCalleeAssignRoot = (null == (assigned = _globalThis.window) ? void 0 : _self)(1);
export const sealedTag = (null == _globalThis.window ? void 0 : _self)`x`;
export const sealedNew = new (null == _globalThis.window ? void 0 : _self)();

// NEGATIVE: the seal consumed by a live `?.` has no plain read above it, so the claim proceeds
export const optionalConsumer = null == _globalThis.window ? void 0 : _Array$of(1);