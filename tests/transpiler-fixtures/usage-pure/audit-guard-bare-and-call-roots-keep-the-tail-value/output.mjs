import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// bare and call-returned proxy roots keep each tail's value and short-circuit: a live `?.` after
// the landing stays over the ternary, and a nullish fallback on a plain carrier wraps the whole
// folded value instead of binding to its alternate.
_globalThis.bareHost = {
  a: 1
};
export const bareRootOptionalTail = (null == _globalThis.window ? void 0 : _self.bareHost)?.a;
export const bareRootCarrierTail = (null == _globalThis.window ? void 0 : _self.bareHost.a) ?? 0;
export const callRootOptionalTail = (null == (() => _globalThis)().window ? void 0 : _self.bareHost)?.a;