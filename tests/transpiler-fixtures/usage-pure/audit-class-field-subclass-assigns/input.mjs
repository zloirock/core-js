// `class D extends C` - subclass instances are the same heap object as C's for public
// field storage. `this.box = "hello"` in D contributes to C.box's type union alongside
// C's own init; Array|string collapses to unknown, generic `_at` emitted
class C {
  box = [1, 2, 3];
  first() { return this.box.at(0); }
}
class D extends C {
  stringify() { this.box = "hello"; }
}
