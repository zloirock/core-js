import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
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
// bodyless function-signature types name globals in their params without any function body to
// drive the param-type walk, so usage-global must sweep them directly. distinct globals per
// signature shape make it clear which line drives which polyfill
interface Reader {
  read(a: Map<number>): void;
}
declare function make(b: Set<number>): void;
type Handler = (c: WeakMap<object, number>) => void;
abstract class Base {
  abstract run(d: WeakSet<object>): void;
}
export { make, Base };
export type { Reader, Handler };