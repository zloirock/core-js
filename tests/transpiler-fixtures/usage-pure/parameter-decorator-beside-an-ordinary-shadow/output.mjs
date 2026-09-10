import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
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