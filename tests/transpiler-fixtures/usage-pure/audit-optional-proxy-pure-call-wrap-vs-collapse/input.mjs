// An optional `?.` on a proxy-global chain rooted in an inline-resolvable PURE call (`(() => globalThis)()
// ?.self.X`) keeps the call LIVE in the null-guard (`_ref = call`) when the polyfill WRAPS the chain as a
// runtime receiver. the call's inner proxy-global stays visitor-rewritten (`globalThis -> _globalThis`, else
// a raw global / IE11 ReferenceError); the `.self` proxy hop always drops. a POLYFILLED ctor in the wrapped
// receiver still collapses to its pure binding (`.self.Map` -> `_Map`); a NATIVE ctor has none, so it reads
// off the memoized root (`_ref.Array.prototype`). two receiver-wrapping shapes: an instance method (native
// Array), an `instance`-kind `.name` get (polyfilled Map). two receiver-LESS shapes COLLAPSE the whole chain
// to a single import (a ctor, a called static) and drop the now-subsumed call. distinct method per line.
const wrapInstance = (() => globalThis)()?.self.Array.prototype.at.call([1, [2]], 0);
const wrapGet = (() => globalThis)()?.self.Map.name;
const collapseCtor = (() => globalThis)()?.self.WeakSet;
const collapseStatic = (() => globalThis)()?.self.Object.fromEntries([]);
export { wrapInstance, wrapGet, collapseCtor, collapseStatic };
