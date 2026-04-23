import _at from "@core-js/pure/actual/instance/at";
// `class D extends C` - subclass instances are the same heap object as C's for public
// field storage. `this.box = "hello"` in D contributes to C.box's type union alongside
// C's own init; Array|string collapses to unknown, generic `_at` emitted
class C {
  box = [1, 2, 3];
  first() {
    var _ref;
    return _at(_ref = this.box).call(_ref, 0);
  }
}
class D extends C {
  stringify() {
    this.box = "hello";
  }
}