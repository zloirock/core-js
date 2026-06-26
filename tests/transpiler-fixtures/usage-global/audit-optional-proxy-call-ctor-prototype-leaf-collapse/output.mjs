import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
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