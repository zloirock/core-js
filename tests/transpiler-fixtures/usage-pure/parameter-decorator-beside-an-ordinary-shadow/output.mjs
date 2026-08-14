import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// a parameter decorator is evaluated where the CLASS is defined - outside the parameter list it
// hangs off AND outside the decorated function - so neither an ordinary PARAMETER of that name nor
// a BODY declaration of it shadows what the decorator reads. `Map` is shadowed by the parameter and
// `Set` by a body declaration; each is read from BOTH positions, so the decorator read resolves
// while the body read stays the user's binding. `WeakMap` / `WeakSet` are the unshadowed controls
class Boxed {
  constructor(@inject(new _Map())
  Map: any, @inject(new _Set())
  other: any) {
    let Set = 1;
    this.first = new _WeakMap();
    return [Map, other, Set];
  }
  reach() {
    return new _WeakSet();
  }
}
new Boxed(function () {}, function () {}).reach();