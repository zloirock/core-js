import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
var _ref, _ref2, _ref3;
// Whether an optional proxy chain rooted in a PURE call rebinds (keeps the call live) or collapses (drops it)
// turns on the LEAF polyfill, not the static: babel REBINDS only when a receiver-WRAPPING `instance` polyfill
// (`_nameMaybeFunction` / `_atMaybeArray`) keeps the chain as a runtime receiver. a polyfilled ctor's
// prototype method invoked at the leaf (`Map.prototype.has.call`) routes THROUGH the ctor polyfill
// (`_Map.prototype.has`) and COLLAPSES, dropping the call - its inner must be subsumed (keeping it orphaned the
// inner global). a NATIVE ctor's prototype method (`Array.prototype.at`) wraps, so it rebinds; and a wrapper
// `.name` ABOVE the prototype method (`Set.prototype.add.name`) also rebinds; and a [Symbol.iterator] leaf (also a _getIteratorMethod wrapper) rebinds too. distinct ctor per line.
const collapseProtoMethod = _Map.prototype.has.call(new _Map(), 1);
const rebindNativeProto = null == (_ref = (() => _globalThis)()) ? void 0 : _atMaybeArray(_ref.self.Array.prototype).call([1, [2]], 0);
const rebindWrapperAbove = null == (_ref2 = (() => _globalThis)()) ? void 0 : _nameMaybeFunction(_ref2.self.Set.prototype.add);
const rebindSymbolIter = null == (_ref3 = (() => _globalThis)()) ? void 0 : _getIteratorMethod(_ref3.self.WeakMap.prototype);
export { collapseProtoMethod, rebindNativeProto, rebindWrapperAbove, rebindSymbolIter };