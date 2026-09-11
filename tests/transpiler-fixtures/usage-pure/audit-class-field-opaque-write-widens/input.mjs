// a `this.field = <opaque>` write (RHS type unresolvable) must WIDEN the field to unknown,
// not be dropped - dropping leaves it narrowed to its array init and emits a type-specific Maybe
// helper that throws on the foreign runtime value (ie:11). the opaque write -> generic `_at`
class C {
  field = [1, 2];
  m(make) {
    this.field = make();
    return this.field.at(0);
  }
}
