import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
var _ref, _ref2;
// An optional `?.` on a proxy-global chain rooted in an inline-resolvable PURE call (`(() => globalThis)()
// ?.self.X`) keeps the call LIVE in the null-guard (`_ref = call`) when the polyfill WRAPS the chain as a
// runtime receiver. the call's inner proxy-global stays visitor-rewritten (`globalThis -> _globalThis`, else
// a raw global / IE11 ReferenceError); the `.self` proxy hop always drops. a POLYFILLED ctor in the wrapped
// receiver still collapses to its pure binding (`.self.Map` -> `_Map`); a NATIVE ctor has none, so it reads
// off the memoized root (`_ref.Array.prototype`). two receiver-wrapping shapes: an instance method (native
// Array), an `instance`-kind `.name` get (polyfilled Map). two receiver-LESS shapes COLLAPSE the whole chain
// to a single import (a ctor, a called static) and drop the now-subsumed call. distinct method per line.
const wrapInstance = null == (_ref = (() => _globalThis)()) ? void 0 : _atMaybeArray(_ref.Array.prototype).call([1, [2]], 0);
const wrapGet = null == (_ref2 = (() => _globalThis)()) ? void 0 : _nameMaybeFunction(_Map);
const collapseCtor = _WeakSet;
const collapseStatic = _Object$fromEntries([]);
export { wrapInstance, wrapGet, collapseCtor, collapseStatic };