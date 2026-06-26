// An optional `?.` on a proxy-global chain rooted in an inline-resolvable PURE call (`(() => globalThis)()?.
// self.X`) keeps the call LIVE in the null-guard (`_ref = call`) instead of inlining it away. So when the
// polyfill WRAPS the chain as a runtime receiver, the call's inner proxy-global must STAY visitor-rewritten
// (`globalThis -> _globalThis`, else a raw global / IE11 ReferenceError) and the rebound tail reads off `_ref`
// (`_ref.self.X`, NOT a collapsed `_self`). two receiver-wrapping shapes: an instance method, and an
// `instance`-kind `.name` get. two receiver-LESS shapes instead COLLAPSE the whole chain to a single import
// (a ctor on the proxy-global, a called static method) and correctly drop the now-subsumed call. distinct
// method per line.
const wrapInstance = (() => globalThis)()?.self.Array.prototype.at.call([1, [2]], 0);
const wrapGet = (() => globalThis)()?.self.Map.name;
const collapseCtor = (() => globalThis)()?.self.WeakSet;
const collapseStatic = (() => globalThis)()?.self.Object.fromEntries([]);
export { wrapInstance, wrapGet, collapseCtor, collapseStatic };
