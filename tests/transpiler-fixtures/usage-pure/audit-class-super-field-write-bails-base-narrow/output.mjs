import _at from "@core-js/pure/actual/instance/at";
// Subclass writes inherited base field through `super.items = "string"`. the assignment
// targets BASE class C's instance-field slot (super in subclass refers to parent), so it
// must fold into C's field-flow union. buildThisWritesIndex previously accepted only
// `this.<field>` LHS receivers - `super.<field>` writes were silently dropped, and
// `this.items.at(0)` inside C.getFirst narrowed to array-only despite the runtime string
// reassignment surfacing on `new D().reset(); new C().getFirst()` call orders
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
class D extends C {
  reset() {
    super.items = "string";
  }
}
new D().reset();
new C().getFirst();