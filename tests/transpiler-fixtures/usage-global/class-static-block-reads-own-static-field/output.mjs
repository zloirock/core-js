import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
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
import "core-js/modules/web.dom-collections.iterator";
// a static block and a later static field read a static DATA field of their own class through the
// class name: the class-scope binding is initialized before any static element runs, and the field
// evaluates before the reader - so the read resolves; a block standing BEFORE the field, or one that
// reassigns it, reads what the source reads there
class Holder {
  static M = Map;
  static {
    use(Holder.M.groupBy);
  }
  static A = Array;
  static G = Holder.A.from;
}
class Early {
  static {
    use(Early.P?.try);
  }
  static P = Promise;
}
class Swapped {
  static O = Object;
  static {
    Swapped.O = Set;
    use(Swapped.O.fromEntries);
  }
}