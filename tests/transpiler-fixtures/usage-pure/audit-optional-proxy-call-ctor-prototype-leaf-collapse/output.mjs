import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
var _ref, _ref2, _ref3;
// An optional proxy chain rooted in a PURE call: the `.self` proxy hop always drops and a POLYFILLED ctor
// collapses to its pure binding, matching the non-optional collapse. two axes stay observable. GUARD: a
// receiver-WRAPPING instance polyfill (`_atMaybeArray` / `_nameMaybeFunction` / `_getIteratorMethod`) keeps
// the `?.` null-guard on the root call and reads the collapsed receiver in its non-null branch; a receiver-
// LESS leaf routes through the ctor polyfill and is always defined (`Map.prototype.has.call` ->
// `_Map.prototype.has.call`, no guard), subsuming the call. CTOR: a polyfilled ctor (`Set` / `WeakMap`)
// becomes `_Set` / `_WeakMap`; a NATIVE ctor (`Array`) has no pure binding, so it stays a live read off the
// memoized guard root (`_ref.Array.prototype`). distinct ctor per line.
const collapseProtoMethod = _Map.prototype.has.call(new _Map(), 1);
const rebindNativeProto = null == (_ref = (() => _globalThis)()) ? void 0 : _atMaybeArray(_ref.Array.prototype).call([1, [2]], 0);
const rebindWrapperAbove = null == (_ref2 = (() => _globalThis)()) ? void 0 : _nameMaybeFunction(_Set.prototype.add);
const rebindSymbolIter = null == (_ref3 = (() => _globalThis)()) ? void 0 : _getIteratorMethod(_WeakMap.prototype);
export { collapseProtoMethod, rebindNativeProto, rebindWrapperAbove, rebindSymbolIter };