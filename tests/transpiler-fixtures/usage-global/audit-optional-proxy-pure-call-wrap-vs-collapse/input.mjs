// usage-global counterpart: the member expression stays verbatim, so this locks that DETECTION still resolves
// the polyfills THROUGH an optional proxy-global chain rooted in a PURE call and injects each side-effect
// import. the inner proxy-global of the kept null-guard call must rewrite (`globalThis -> _globalThis`) the
// same as pure, and the receiver-LESS collapse cases (ctor / called static method) drop the subsumed call.
// distinct method per line: instance method, `instance`-kind `.name` get, ctor on the proxy-global, static method.
const wrapInstance = (() => globalThis)()?.self.Array.prototype.at.call([1, [2]], 0);
const wrapGet = (() => globalThis)()?.self.Map.name;
const collapseCtor = (() => globalThis)()?.self.WeakSet;
const collapseStatic = (() => globalThis)()?.self.Object.fromEntries([]);
export { wrapInstance, wrapGet, collapseCtor, collapseStatic };
