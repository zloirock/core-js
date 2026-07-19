import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref, _ref2, _ref3;
// OPTIONAL `.name` (MaybeFunction get) on a proxy chain-root-CALL receiver `(call)?.self.Ctor.name`. the
// `?.` guard memoizes the call into `_ref`, RUNNING its receiver-SE there exactly ONCE - the body must NOT
// re-emit that receiver-SE (it double-ran the call on BOTH emitters before). the receiver is receiver-
// INDEPENDENT (a proxy chain to a pure ctor), so it collapses to the pure binding (`_Map`) and the guard
// serves only the null-check; the `.self` (and `.self.window`) proxy hops drop. a computed key-SE is a TAIL
// effect past the root, so it folds ahead of the pure ctor in the non-null branch (`(n += 1000, _WeakMap)`,
// runs only when the receiver is non-nullish). distinct ctor + side-effect shape per line: bare root, a deep
// `.self.window` hop, a computed key-SE.
let n = 0;
const bareRoot = null == (_ref = (() => {
  n += 1;
  return _globalThis;
})()) ? void 0 : _nameMaybeFunction(_Map);
const deepHop = null == (_ref2 = (() => {
  n += 10;
  return _globalThis;
})()) ? void 0 : _nameMaybeFunction(_Set);
const keySe = null == (_ref3 = (() => {
  n += 100;
  return _globalThis;
})()) ? void 0 : _nameMaybeFunction((n += 1000, _WeakMap));
export { bareRoot, deepHop, keySe, n };