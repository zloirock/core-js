import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
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
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
// a parameter decorator is evaluated where the CLASS is defined - outside the parameter list it
// hangs off AND outside the decorated function - so neither an ordinary PARAMETER of that name nor
// a BODY declaration of it shadows what the decorator reads. `Map` is shadowed by the parameter and
// `Set` by a body declaration; each is read from BOTH positions, so the decorator read resolves
// while the body read stays the user's binding. `WeakMap` / `WeakSet` are the unshadowed controls.
// the two shadows answer differently once the name escapes through the constructor's return: the
// BODY declaration is a binding this file wrote and hands out itself, while the PARAMETER is filled
// by whoever constructs the class - and a decorator is handed the class, so the callers are not the
// `new` below alone. that difference is a usage-GLOBAL one: the flavor patching the one slot every
// read lands on covers a caller's value too. usage-pure substitutes its minted binding only where
// the realm is proven, and a parameter with no default of its own is never that binding - the value
// it holds comes from the caller, so the pure entry stays the constructor's own
class Boxed {
  constructor(@inject(new Map())
  Map: any, @inject(new Set())
  other: any) {
    let Set = 1;
    this.first = new WeakMap();
    return [Map, other, Set];
  }
  reach() {
    return new WeakSet();
  }
}
new Boxed(function () {}, function () {}).reach();