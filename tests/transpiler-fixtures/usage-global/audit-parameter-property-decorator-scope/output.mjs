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
import "core-js/modules/web.dom-collections.iterator";
// a parameter decorator is evaluated where the CLASS is defined, so the parameter properties it
// hangs off are NOT in scope for it. `Map` carries that on ONE binding: read from the decorator it
// is the global and resolves, read from the body three lines later it is the caller's argument and
// must stay raw - only the position differs, which the per-site pure output shows directly. The
// import set cannot separate those two sites, so `WeakMap` is read from the body ONLY and its
// ABSENCE is what witnesses the suppression there; `Set` is the unshadowed control.
class Boxed {
  constructor(@inject(new Map())
  private Map: any, private WeakMap: any) {
    this.first = new Map();
    this.second = new WeakMap();
  }
  reach() {
    return new Set([1]);
  }
}
new Boxed(function () {}, function () {}).reach();