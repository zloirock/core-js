import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
var _ref, _ref2;
// An optional `?.` on a proxy-global chain rooted in an inline-resolvable PURE call (`(() => globalThis)()?.
// self.X`) keeps the call LIVE in the null-guard (`_ref = call`) instead of inlining it away. So when the
// polyfill WRAPS the chain as a runtime receiver, the call's inner proxy-global must STAY visitor-rewritten
// (`globalThis -> _globalThis`, else a raw global / IE11 ReferenceError) and the rebound tail reads off `_ref`
// (`_ref.self.X`, NOT a collapsed `_self`). two receiver-wrapping shapes: an instance method, and an
// `instance`-kind `.name` get. two receiver-LESS shapes instead COLLAPSE the whole chain to a single import
// (a ctor on the proxy-global, a called static method) and correctly drop the now-subsumed call. distinct
// method per line.
const wrapInstance = null == (_ref = (() => _globalThis)()) ? void 0 : _atMaybeArray(_ref.self.Array.prototype).call([1, [2]], 0);
const wrapGet = null == (_ref2 = (() => _globalThis)()) ? void 0 : _nameMaybeFunction(_ref2.self.Map);
const collapseCtor = _WeakSet;
const collapseStatic = _Object$fromEntries([]);
export { wrapInstance, wrapGet, collapseCtor, collapseStatic };