// Whether an optional proxy chain rooted in a PURE call rebinds (keeps the call live) or collapses (drops it)
// turns on the LEAF polyfill, not the static: babel REBINDS only when a receiver-WRAPPING `instance` polyfill
// (`_nameMaybeFunction` / `_atMaybeArray`) keeps the chain as a runtime receiver. a polyfilled ctor's
// prototype method invoked at the leaf (`Map.prototype.has.call`) routes THROUGH the ctor polyfill
// (`_Map.prototype.has`) and COLLAPSES, dropping the call - its inner must be subsumed (keeping it orphaned the
// inner global). a NATIVE ctor's prototype method (`Array.prototype.at`) wraps, so it rebinds; and a wrapper
// `.name` ABOVE the prototype method (`Set.prototype.add.name`) also rebinds; and a [Symbol.iterator] leaf (also a _getIteratorMethod wrapper) rebinds too. distinct ctor per line.
const collapseProtoMethod = (() => globalThis)()?.self.Map.prototype.has.call(new Map(), 1);
const rebindNativeProto = (() => globalThis)()?.self.Array.prototype.at.call([1, [2]], 0);
const rebindWrapperAbove = (() => globalThis)()?.self.Set.prototype.add.name;
const rebindSymbolIter = (() => globalThis)()?.self.WeakMap.prototype[Symbol.iterator];
export { collapseProtoMethod, rebindNativeProto, rebindWrapperAbove, rebindSymbolIter };
