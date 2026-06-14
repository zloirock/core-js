import _at from "@core-js/pure/actual/instance/at";
// a `this.field = <opaque>` write (RHS type unresolvable) must WIDEN the field to unknown,
// not be dropped - dropping leaves it narrowed to its array init and emits a type-specific Maybe
// helper that throws on the foreign runtime value (ie:11). the opaque write -> generic `_at`
class C {
  field = [1, 2];
  m(make) {
    var _ref;
    this.field = make();
    return _at(_ref = this.field).call(_ref, 0);
  }
}