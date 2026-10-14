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
import "core-js/modules/web.dom-collections.iterator";
// usage-global counts a global present wherever the data subset it is configured for carries it: whether the
// build injects it (`WeakSet`) or the user's filter drops its constructor (`WeakMap`), the right of a `||` over it
// never runs and loads nothing. A global the subset lacks at the mode (`AsyncIterator` below `full`) decides
// nothing: the right keeps its module (`Math.sumPrecise`).
export const excluded = globalThis.WeakMap || Object.fromEntries(pairs);
export const injected = globalThis.WeakSet || Array.of(item);
export const uncarried = globalThis.AsyncIterator || Math.sumPrecise(list);