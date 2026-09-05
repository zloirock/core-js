// const D = C alias-instance: writes via `new D()` bound to `d` MUST count toward base class
// C's instance field-flow fold. without alias awareness, `new D()` was not recognized as a C
// instance, the external `d.items = "string"` write dropped, and `this.items.at(0)` narrowed
// to array-only - unsound on String. alias instances now widen the fold to the generic `_at`
class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}
const D = C;
const d = new D();
d.items = "string";
new C().getFirst();
