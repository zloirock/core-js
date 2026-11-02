import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.async-iterator.async-dispose";
import "core-js/modules/es.global-this";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/esnext.async-iterator.constructor";
import "core-js/modules/web.dom-collections.iterator";
// usage-global counts a global present when its constructor entry exists at the selected mode, even when
// the user's filter excludes it (`WeakMap`). These fallbacks load nothing, as for an injected `WeakSet`.
// The separate AsyncIterator constructor entry is unavailable below full, so its fallback keeps Math.sumPrecise.
// Loading its namespace family can still bring the constructor as a dependency; it does not decide this fallback.
export const excluded = globalThis.WeakMap || Object.fromEntries(pairs);
export const injected = globalThis.WeakSet || Array.of(item);
export const uncarried = globalThis.AsyncIterator || Math.sumPrecise(list);