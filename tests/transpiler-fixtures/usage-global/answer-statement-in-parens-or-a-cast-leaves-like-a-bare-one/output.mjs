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
// usage-global rewrites none of these statements: a listed statement holding a decided test's answer loads
// the modules of the global its test reads however the test is wrapped - in parens, a TS cast or a `!` - and
// so does one standing alone in an arm or read as a value; the install the test guards, which never runs,
// still loads the realm it writes through
typeof Symbol == 'undefined' && (globalThis.Symbol = SymbolShim);
(typeof Map == 'undefined' && (globalThis.Map = MapShim)) as unknown;
(typeof Set == 'undefined' && (globalThis.Set = SetShim))!;
if (ready) typeof WeakMap == 'undefined' && (globalThis.WeakMap = WeakMapShim);
export const installed = typeof WeakSet == 'undefined' && (globalThis.WeakSet = WeakSetShim);