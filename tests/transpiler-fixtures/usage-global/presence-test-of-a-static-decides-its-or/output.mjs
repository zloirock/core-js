import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
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
import "core-js/modules/web.dom-collections.iterator";
// a presence test of a static decides a `||` where the catalogue names the static a method - its `typeof`
// is a function and an `in` test of its key is true once injected - so the right never runs and injects
// nothing. a well-known symbol's `typeof` decides nothing: the right of its `&&` may run, and injects
export const viaTypeof = typeof Array.from == 'function' || Promise.resolve(fallback);
export const viaIn = 'of' in Array || new Map(fallback);
export const viaSymbol = typeof Symbol.asyncIterator == 'symbol' && new Set(fallback);