import _at from "@core-js/pure/actual/instance/at";
// a subclass writes an inherited base field via `super.items = "string"`. since super in
// the subclass refers to the parent, the assignment targets base C's field slot and must
// fold into C's field-flow union. accepting only `this.<field>` and not `super.<field>` LHS
// drops the write, so `this.items.at(0)` in C.getFirst narrows array-only despite `new D().reset()`
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