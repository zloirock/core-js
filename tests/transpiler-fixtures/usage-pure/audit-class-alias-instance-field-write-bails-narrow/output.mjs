import _at from "@core-js/pure/actual/instance/at";
// const D = C alias-instance: writes via `new D()` bound to `d` MUST count toward the
// base class C's instance field-flow fold. without the alias-aware closure, `new D()`
// did not match descendant.names = ['C'], the external `d.items = "string"` write was
// dropped, and `this.items.at(0)` inside getFirst() narrowed to array-only - blowing up
// at runtime on String. collectInstanceConstructorNames now unions class-binding-closure
// names with descendant.names so alias-instance writes widen the fold to generic _at
class C {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _at(_ref = this.items).call(_ref, 0);
  }
}
const D = C;
const d = new D();
d.items = "string";
new C().getFirst();