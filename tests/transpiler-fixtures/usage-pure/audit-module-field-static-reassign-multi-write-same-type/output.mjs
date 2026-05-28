import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// repeated module-wide writes to the same open-typed static field with mutually compatible
// RHS types (both Array) fold into a single Array slot and narrow dispatch stays sound.
// confirms the candidate collector reaches every write site, not just the last one
class Foo {
  static bar: any = null;
}
const arr1 = [1, 2];
const arr2 = [3, 4];
Foo.bar = arr1;
Foo.bar = arr2;
_atMaybeArray(_ref = Foo.bar).call(_ref, 0);