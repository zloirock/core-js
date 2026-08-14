// a parameter decorator is evaluated where the CLASS is defined - outside the parameter list it
// hangs off AND outside the decorated function - so neither an ordinary PARAMETER of that name nor
// a BODY declaration of it shadows what the decorator reads. `Map` is shadowed by the parameter and
// `Set` by a body declaration; each is read from BOTH positions, so the decorator read resolves
// while the body read stays the user's binding. `WeakMap` / `WeakSet` are the unshadowed controls
class Boxed {
  constructor(@inject(new Map()) Map: any, @inject(new Set()) other: any) {
    let Set = 1;
    this.first = new WeakMap();
    return [Map, other, Set];
  }
  reach() {
    return new WeakSet();
  }
}
new Boxed(function () {}, function () {}).reach();
