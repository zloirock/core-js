import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
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
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// usage-global rewrites none of these sequences: an element ahead of the value and the value itself load
// the modules of the global their tests read, folded away in pure or not
typeof Symbol == 'undefined' && (globalThis.Symbol = SymbolShim), run();
typeof Set == 'undefined' && (globalThis.Set = SetShim), finish();
export const started = (typeof Map == 'undefined' ? installMap() : 0, start());
export const last = (prepare(), typeof WeakMap == 'undefined' && (globalThis.WeakMap = WeakMapShim));
const handler = {
  fire() {
    return this;
  }
};
export const unbound = (typeof WeakSet == 'undefined' && (globalThis.WeakSet = WeakSetShim), handler.fire)();