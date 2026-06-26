import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref, _ref2, _ref3;
// OPTIONAL `.name` (MaybeFunction get) on a proxy chain-root-CALL receiver `(call)?.self.Ctor.name`. the
// `?.` guard memoizes the call into `_ref`, RUNNING its receiver-SE there exactly ONCE - the body must NOT
// re-emit that receiver-SE (it double-ran the call on BOTH emitters before) and must NOT inject a dead pure
// ctor import (the optional rebind keeps the raw `_ref.self.Ctor` hop off the memoized root, so no `_Map`).
// a computed key-SE folds into the guard's non-null branch (runs only when the receiver is non-nullish).
// distinct ctor + side-effect shape per line: bare root, a deep `.self.window` hop, a computed key-SE.
let n = 0;
const bareRoot = null == (_ref = (() => {
  n += 1;
  return _globalThis;
})()) ? void 0 : _nameMaybeFunction(_ref.self.Map);
const deepHop = null == (_ref2 = (() => {
  n += 10;
  return _globalThis;
})()) ? void 0 : _nameMaybeFunction(_ref2.self.window.Set);
const keySe = null == (_ref3 = (() => {
  n += 100;
  return _globalThis;
})()) ? void 0 : _nameMaybeFunction(_ref3.self[n += 1000, "WeakMap"]);
export { bareRoot, deepHop, keySe, n };