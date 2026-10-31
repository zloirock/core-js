// An optional proxy chain rooted in a PURE call: the `.self` proxy hop always drops and a POLYFILLED ctor
// collapses to its pure binding, matching the non-optional collapse. two axes stay observable. GUARD: a
// receiver-WRAPPING instance polyfill (`_atMaybeArray` / `_nameMaybeFunction` / `_getIteratorMethod`) keeps
// the `?.` null-guard on the root call and reads the collapsed receiver in its non-null branch; a receiver-
// LESS leaf routes through the ctor polyfill and is always defined (`Map.prototype.has.call` ->
// `_Map.prototype.has.call`, no guard), subsuming the call. CTOR: a polyfilled ctor (`Set` / `WeakMap`)
// becomes `_Set` / `_WeakMap`; a NATIVE ctor (`Array`) has no pure binding, so it stays a live read off the
// memoized guard root (`_ref.Array.prototype`). distinct ctor per line.
const collapseProtoMethod = (() => globalThis)()?.self.Map.prototype.has.call(new Map(), 1);
const rebindNativeProto = (() => globalThis)()?.self.Array.prototype.at.call([1, [2]], 0);
const rebindWrapperAbove = (() => globalThis)()?.self.Set.prototype.add.name;
const rebindSymbolIter = (() => globalThis)()?.self.WeakMap.prototype[Symbol.iterator];
export { collapseProtoMethod, rebindNativeProto, rebindWrapperAbove, rebindSymbolIter };
